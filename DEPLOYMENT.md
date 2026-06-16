# EduCare AI STEM & Circuit Simulator - Split Deployment Guide

This document contains instructions to deploy the EduCare AI STEM & Circuit Simulator application.

## 1. Updated Project Folder Structure

```
EduCare AI/
├── .github/                   # GitHub Actions workflows
├── backend/                   # Node.js + Express backend
│   ├── data/                  # Lesson data
│   ├── routes/                # Express routes
│   ├── .env.example           # Backend environment template
│   ├── package.json           # Backend dependencies and scripts
│   └── server.js              # Backend entry point
├── frontend/                  # React + Vite frontend
│   ├── src/                   # React components and pages
│   │   ├── config.js          # API URL configuration [NEW]
│   │   └── ...
│   ├── .env.example           # Frontend environment template [NEW]
│   ├── package.json           # Frontend dependencies and scripts
│   ├── vercel.json            # Vercel SPA routing configuration [NEW]
│   └── ...
├── DEPLOYMENT.md              # Deployment guide [NEW]
├── package.json               # Monorepo root configuration
└── README.md                  # Project documentation
```

## 2. Required Code Changes for Split Deployment
To split the frontend and backend deployments, we executed the following:
1. **Removed Root `vercel.json`**: The root-level deployment configuration was deleted to allow independent frontend build on Vercel.
2. **Added Frontend SPA Routing (`frontend/vercel.json`)**: Configured Vercel's clean URLs and URL rewrites to route all SPA paths back to `index.html`.
3. **Refactored Frontend API Calls**: Prepend `API_BASE` (imported from `frontend/src/config.js`) to all API fetch paths instead of relying on relative serverless paths.
4. **Enabled Production CORS**: Configured the backend's `cors()` middleware to allow cross-origin requests from the custom frontend Vercel URL, localhost, and Vercel preview environments (`*.vercel.app`).
5. **Production Listener for Render**: Replaced the serverless-only logic in `backend/server.js` with `app.listen()` so the backend binds to the required port on Render.
6. **Health Check Endpoint**: Exposed `/health` and `/api/health` endpoints to allow Render to verify instance status.

## 3. Environment Variable Configuration

### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend/` directory or configure these variables in the Vercel Dashboard:
```env
VITE_API_URL=https://your-backend-url.onrender.com
```
*Note: Any environment variable used in the client-side code must start with `VITE_`.*

### Backend (`backend/.env`)
Create a `.env` file in the `backend/` directory or configure these variables in the Render Dashboard:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/educare-ai?retryWrites=true&w=majority
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://your-vercel-frontend-url.vercel.app
```

---

## 4. Deployment Checklists & Steps

### A. MongoDB Atlas (Database)
1. **Sign Up/Log In**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in.
2. **Create a Cluster**: Deploy a new free cluster (Shared Tier M0) in your preferred cloud provider and region.
3. **Database User**: Go to **Database Access** -> **Add New Database User**. Choose Password authentication and assign the role `Read and write to any database`.
4. **Network Access**: Go to **Network Access** -> **Add IP Address**. For deployment, add `0.0.0.0/0` (allow access from anywhere) so that Render server instances can connect.
5. **Get Connection String**: Go to **Database** -> **Connect** -> **Drivers**. Copy the connection string. Replace `<password>` with the database user's password and change the database name to `educare-ai`. Save this string as `MONGODB_URI` for the backend.

### B. Render (Backend)
1. **Sign Up/Log In**: Go to [Render](https://render.com) and link your GitHub account.
2. **Create Web Service**: Click **New +** -> **Web Service**. Select your GitHub repository.
3. **Configure Settings**:
   - **Name**: `educare-ai-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. **Configure Environment Variables**: Under the **Environment** tab, click **Add Environment Variable** and enter:
   - `PORT` = `5000` (or leave empty to let Render assign)
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = `<your-mongodb-atlas-connection-string>`
   - `ALLOWED_ORIGINS` = `https://your-vercel-app-name.vercel.app`
5. **Deploy**: Render will automatically start building and deploy your Express backend. Copy the generated Web Service URL (e.g. `https://educare-ai-backend.onrender.com`).

### C. Vercel (Frontend)
1. **Sign Up/Log In**: Go to [Vercel](https://vercel.com) and link your GitHub account.
2. **Import Project**: Click **Add New** -> **Project**. Select your GitHub repository.
3. **Configure Project Settings**:
   - **Framework Preset**: `Vite` (Vercel will auto-detect Vite)
   - **Root Directory**: `frontend` (Click edit and select `frontend`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. **Configure Environment Variables**: Expand **Environment Variables** and add:
   - Key: `VITE_API_URL`
   - Value: `<your-render-backend-url>` (without a trailing slash, e.g. `https://educare-ai-backend.onrender.com`)
5. **Deploy**: Click **Deploy**. Vercel will build your static React files and serve them as a Single Page Application (SPA).

### D. GitHub (Version Control & CI/CD)
1. Ensure you have the `development` and `main` branches set up.
2. Run standard git operations to push the latest changes:
   ```bash
   git add .
   git commit -m "Configure project for split deployment"
   git push origin main
   ```
