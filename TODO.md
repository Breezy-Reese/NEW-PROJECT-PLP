# Configure Frontend for Production API

## Tasks
- [x] Create .env file with VITE_API_BASE_URL=https://devcollab-carsonn.onrender.com
- [x] Update src/contexts/AuthContext.tsx to use environment variable instead of localhost:5000
- [x] Update src/components/DeveloperSearch.tsx to use environment variable
- [x] Update src/components/ProfileSetup.tsx to use environment variable
- [x] Update backend/server.js CORS to allow https://devcollab-carsonn.vercel.app
- [x] Update Socket.IO CORS in backend/server.js
- [ ] Test development still works with localhost fallback
