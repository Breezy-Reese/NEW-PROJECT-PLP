const express = require('express');
const { authenticateToken, requireAdmin } = require('./auth');
const User = require('../models/User');
const Project = require('../models/Project');
const Message = require('../models/Message');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find().populate('created_by', 'name username email');
    const projectsWithOwner = projects.map(project => ({
      ...project.toObject(),
      owner: project.created_by
    }));
    res.json({ projects: projectsWithOwner });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete project
router.delete('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('sender_id', 'name username')
      .populate('receiver_id', 'name username')
      .sort({ createdAt: -1 });
    const messagesWithSenderReceiver = messages.map(message => ({
      ...message.toObject(),
      sender: message.sender_id,
      receiver: message.receiver_id
    }));
    res.json({ messages: messagesWithSenderReceiver });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete message
router.delete('/messages/:id', async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get admin stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalMessages = await Message.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });

    res.json({
      stats: {
        totalUsers,
        totalProjects,
        totalMessages,
        adminUsers
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Set user role (promote/demote)
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get users chart data (registrations by month)
router.get('/users/chart', async (req, res) => {
  try {
    const usersByMonth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    res.json({ usersByMonth });
  } catch (error) {
    console.error('Get users chart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get projects chart data (projects by month)
router.get('/projects/chart', async (req, res) => {
  try {
    const projectsByMonth = await Project.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    res.json({ projectsByMonth });
  } catch (error) {
    console.error('Get projects chart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get messages chart data (messages by month)
router.get('/messages/chart', async (req, res) => {
  try {
    const messagesByMonth = await Message.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    res.json({ messagesByMonth });
  } catch (error) {
    console.error('Get messages chart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user roles distribution
router.get('/users/roles', async (req, res) => {
  try {
    const roles = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);
    res.json({ roles });
  } catch (error) {
    console.error('Get user roles error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all chart data combined
router.get('/charts', async (req, res) => {
  try {
    // Get users chart data
    const usersByMonth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Get projects chart data
    const projectsByMonth = await Project.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Get messages chart data
    const messagesByMonth = await Message.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Get user roles distribution
    const roles = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);

    // Format data for frontend
    const formatChartData = (data, key) => {
      return data.map(item => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        [key]: item.count
      }));
    };

    const formatRolesData = (roles) => {
      return roles.map(role => ({
        name: role._id,
        value: role.count
      }));
    };

    res.json({
      usersChart: formatChartData(usersByMonth, 'users'),
      projectsChart: formatChartData(projectsByMonth, 'projects'),
      messagesChart: formatChartData(messagesByMonth, 'messages'),
      rolesChart: formatRolesData(roles)
    });
  } catch (error) {
    console.error('Get charts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
