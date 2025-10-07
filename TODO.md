# TODO: Implement Socket.IO User Presence Features

## Backend Changes (server.js)
- [x] Add online users tracking using Map (userId -> socketId)
- [x] On socket 'authenticate': Add user to online list, emit 'user_joined' event with user info to all clients
- [x] On socket 'disconnect': Remove user from online list, emit 'user_left' event
- [x] Add 'get_online_users' event to send current online users list to requesting client

## Frontend Changes (Chat.tsx)
- [x] Add state for online users list
- [x] Listen for 'user_joined', 'user_left', 'online_users' events
- [x] Display online users in the chat sidebar
- [x] Show join/leave notifications in the chat area

## Testing
- [ ] Test with multiple users to verify join/leave events and online list
- [ ] Ensure proper cleanup on disconnect
