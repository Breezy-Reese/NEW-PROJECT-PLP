import { useState, useEffect } from 'react';
import { Users, FolderKanban, MessageSquare, Shield, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalMessages: number;
  adminUsers: number;
}

interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  owner: {
    name: string;
    username: string;
    email: string;
  };
  createdAt: string;
}

interface Message {
  _id: string;
  content: string;
  sender: {
    name: string;
    username: string;
  };
  receiver: {
    name: string;
    username: string;
  };
  createdAt: string;
}

interface ChartData {
  month: string;
  users?: number;
  projects?: number;
  messages?: number;
}

interface RoleData {
  name: string;
  value: number;
  [key: string]: any;
}



export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProjects: 0,
    totalMessages: 0,
    adminUsers: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [usersChart, setUsersChart] = useState<ChartData[]>([]);
  const [projectsChart, setProjectsChart] = useState<ChartData[]>([]);
  const [messagesChart, setMessagesChart] = useState<ChartData[]>([]);
  const [rolesChart, setRolesChart] = useState<RoleData[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'projects' | 'messages'>('overview');

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

  // Combine chart data for line chart
  const combinedChartData = usersChart.map((item, index) => ({
    month: item.month,
    users: item.users || 0,
    projects: projectsChart[index]?.projects || 0,
    messages: messagesChart[index]?.messages || 0,
  }));

  useEffect(() => {
    loadStats();
    loadCharts();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'projects') loadProjects();
    if (activeTab === 'messages') loadMessages();
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to load stats');
      const data = await res.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
    setLoading(false);
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to load users');
      const data = await res.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to load projects');
      const data = await res.json();
      setProjects(data.projects);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to load messages');
      const data = await res.json();
      setMessages(data.messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadCharts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/charts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to load charts');
      const data = await res.json();
      setUsersChart(data.usersChart || []);
      setProjectsChart(data.projectsChart || []);
      setMessagesChart(data.messagesChart || []);
      setRolesChart(data.rolesChart || []);
    } catch (error) {
      console.error('Error loading charts:', error);
    }
  };



  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete user');
      setUsers(users.filter(u => u._id !== userId));
      loadStats(); // Refresh stats
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete project');
      setProjects(projects.filter(p => p._id !== projectId));
      loadStats(); // Refresh stats
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete message');
      setMessages(messages.filter(m => m._id !== messageId));
      loadStats(); // Refresh stats
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const action = newRole === 'admin' ? 'promote' : 'demote';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error('Failed to update user role');
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      loadStats(); // Refresh stats
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-red-600" />
          <h2 className="text-2xl font-bold text-slate-900">Admin Dashboard</h2>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6">
          {[
            { key: 'overview', label: 'Overview', icon: Shield },
            { key: 'users', label: 'Users', icon: Users },
            { key: 'projects', label: 'Projects', icon: FolderKanban },
            { key: 'messages', label: 'Messages', icon: MessageSquare },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
              <Users className="w-12 h-12 opacity-80 mb-4" />
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
              <p className="text-blue-100">Total Users</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
              <FolderKanban className="w-12 h-12 opacity-80 mb-4" />
              <p className="text-3xl font-bold">{stats.totalProjects}</p>
              <p className="text-green-100">Total Projects</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <MessageSquare className="w-12 h-12 opacity-80 mb-4" />
              <p className="text-3xl font-bold">{stats.totalMessages}</p>
              <p className="text-purple-100">Total Messages</p>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
              <Shield className="w-12 h-12 opacity-80 mb-4" />
              <p className="text-3xl font-bold">{stats.adminUsers}</p>
              <p className="text-red-100">Admin Users</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Growth Trends</h3>
              <LineChart width={500} height={300} data={combinedChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="projects" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="messages" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">User Roles Distribution</h3>
              <PieChart width={400} height={300}>
                <Pie
                  data={rolesChart}
                  cx={200}
                  cy={150}
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {rolesChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'admin' ? '#ef4444' : '#3b82f6'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">User Management</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Username</th>
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Role</th>
                  <th className="text-left py-2">Joined</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b">
                    <td className="py-2">{user.name}</td>
                    <td className="py-2">{user.username}</td>
                    <td className="py-2">{user.email}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 flex gap-2">
                      <button
                        onClick={() => toggleUserRole(user._id, user.role)}
                        className={`px-2 py-1 rounded text-xs ${
                          user.role === 'admin'
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        {user.role === 'admin' ? 'Demote' : 'Promote'}
                      </button>
                      <button
                        onClick={() => deleteUser(user._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Project Management</h3>
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{project.name}</h4>
                    <p className="text-slate-600 text-sm">{project.description}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      Owner: {project.owner?.name || 'Unknown'} ({project.owner?.username || 'Unknown'})
                    </p>
                    <p className="text-slate-500 text-xs">
                      Created: {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteProject(project._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Message Management</h3>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-700">{message.content}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      From: {message.sender?.name || 'Unknown'} ({message.sender?.username || 'Unknown'}) → To: {message.receiver?.name || 'Unknown'} ({message.receiver?.username || 'Unknown'})
                    </p>
                    <p className="text-slate-500 text-xs">
                      Sent: {new Date(message.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteMessage(message._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
