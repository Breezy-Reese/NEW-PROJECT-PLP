# Configure Frontend for Production API

## Tasks
- [x] Create .env file with VITE_API_BASE_URL=https://devcollab-carsonn.onrender.com
- [x] Update src/contexts/AuthContext.tsx to use environment variable with deployed URL as default
- [x] Update src/components/DeveloperSearch.tsx to use environment variable with deployed URL as default
- [x] Update src/components/ProfileSetup.tsx to use environment variable with deployed URL as default
- [x] Update src/components/Chat.tsx to use VITE_API_BASE_URL with deployed URL as default
- [x] Update src/components/Projects.tsx to use VITE_API_BASE_URL with deployed URL as default
- [x] Update src/components/Dashboard.tsx to use VITE_API_BASE_URL with deployed URL as default
- [x] Update src/components/AdminDashboard.tsx to use VITE_API_BASE_URL with deployed URL as default
- [x] Remove credentials: 'include' from all fetch calls in frontend components
- [x] Update backend/server.js CORS to allow https://devcollab-carsonn.vercel.app
- [x] Update Socket.IO CORS in backend/server.js
- [ ] Test development still works with localhost fallback (set VITE_API_BASE_URL=http://localhost:5000 in local .env)
- [ ] Test production deployment on Vercel
