# Enterprise ERP Deployment & Infrastructure Guide

This application is built with a React SPA frontend (Vite + TypeScript) and an Express backend API (`server.ts`).

---

## 🚀 Netlify Deployment Guide

When deploying the frontend SPA to **Netlify Static Hosting**:

### Problem & Architecture Overview
Netlify Static Hosting serves static HTML/JS/CSS files and does **not** execute custom Node.js Express servers. 
Any client call to relative routes (e.g., `/api/auth/login`) on Netlify returns Netlify's `index.html` (HTTP 404/Fallback), causing:
- "Connection failed" errors
- HTML syntax parsing errors (`Unexpected token '<'`)

### Solution Architecture
To make the application 100% Netlify-compatible:
1. **Frontend (Netlify)**: Builds as a static Single Page Application.
2. **Backend API (Express)**: Hosted on a Node.js cloud platform (Render, Railway, GCP Cloud Run, AWS App Runner).
3. **API Routing (`VITE_API_BASE_URL`)**: All frontend API calls route dynamically through `getApiUrl()` and `apiClient`.

---

## 🔧 Step-by-Step Configuration

### Step 1: Deploy Backend Express Service
Deploy `server.ts` to your preferred cloud platform:

#### Option A: Render
1. Connect your Git repository to [Render](https://render.com).
2. Create a **Web Service**.
3. Set **Build Command**: `npm run build`
4. Set **Start Command**: `npm start` (or `node dist/server.cjs`)
5. Set environment variables (e.g. `JWT_SECRET`, `NODE_ENV=production`).
6. Copy your service URL (e.g., `https://alkaswa-erp-api.onrender.com`).

#### Option B: Railway / Cloud Run
- **Build**: `npm run build`
- **Start**: `npm start`
- **Port**: `3000` or process environment `PORT`

### Step 2: Configure Netlify Environment Variable
In your Netlify Site Settings:
1. Go to **Site Settings > Environment variables**.
2. Add a new key:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://alkaswa-erp-api.onrender.com` (Your backend URL without trailing slash)
3. Trigger a redeploy on Netlify.

---

## 🛠️ Local Development vs Production

| Environment | `VITE_API_BASE_URL` | Behavior |
| :--- | :--- | :--- |
| **Local Dev** | *(Empty / Not set)* | API calls go to relative `/api/*` (handled by Vite / local Express server on port 3000) |
| **Netlify Production** | `https://your-api.onrender.com` | API calls route to your hosted Express backend with CORS enabled |

---

## 🌐 Netlify Redirects Configuration (`public/_redirects`)

The project includes a `public/_redirects` file:
```text
# SPA Route Fallback for React Router
/*    /index.html   200
```
This ensures React deep routes work seamlessly when refreshed on Netlify.

---

## 🔍 Troubleshooting Netlify Deployments

- **"Backend API unavailable" banner**: Displays if `VITE_API_BASE_URL` is not configured or backend server is sleeping/down.
- **CORS Errors**: Ensure your Express server accepts requests from your Netlify domain (`https://your-app.netlify.app`).
- **HTML Response Error**: Handled automatically by `apiClient.ts` to prevent raw JSON parse failures.
