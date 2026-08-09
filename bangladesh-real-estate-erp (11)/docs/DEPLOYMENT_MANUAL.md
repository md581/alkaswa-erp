# AL KASWA HOLDINGS ERP — Deployment & Infrastructure Manual

## Overview
This manual provides complete deployment instructions, container build specifications, and environment configuration guidelines for hosting **AL KASWA HOLDINGS ERP** on Google Cloud Run, Kubernetes, or standalone Docker environments.

---

## 1. System Requirements & Environment Setup

### Node.js & Tooling Baseline
* **Runtime**: Node.js 20.x LTS or higher.
* **Package Manager**: `npm` (v10+).
* **Compiler**: `esbuild` / `tsx` for TypeScript compilation.
* **Port Configuration**: Fixed Port **3000** bound to host **0.0.0.0**.

---

## 2. Environment Variables Configuration

Create a `.env` file in the root project directory (or configure via Cloud Run Environment Settings). Reference `.env.example`:

```env
# ============================================================================
# AL KASWA HOLDINGS ERP — ENVIRONMENT CONFIGURATION
# ============================================================================

# Application Environment
NODE_ENV=production
PORT=3000

# Security & JWT Authentication
JWT_SECRET=alkaswa_enterprise_jwt_secret_key_2026_production_secure_7781
JWT_EXPIRES_IN=24h

# Database Configuration (Optional - Active Fallback to Local JSON Engine)
DATABASE_URL=postgresql://postgres:password@localhost:5432/alkaswa_erp
CLOUD_SQL_CONNECTION_NAME=alkaswa-holdings:asia-southeast1:alkaswa-db

# Offsite Google Cloud Storage Vault
GCS_BUCKET_NAME=alkaswa-holdings-production-vault
GOOGLE_APPLICATION_CREDENTIALS=/app/keys/gcp-service-account.json

# Optional Public API & Gateway Configs
VITE_APP_TITLE="Al Kaswa Holdings ERP"
VITE_API_BASE_URL="https://ais-dev-jqqhrqtovd5fyrg46v5ihu-420420189545.asia-southeast1.run.app"
```

---

## 3. Build & Deployment Pipeline

The production build pipeline compiles both client-side React assets and the server-side Node.js Express API into a self-contained CommonJS distribution (`dist/server.cjs`).

### Build Command Sequence
```bash
# 1. Install all production and development dependencies
npm install

# 2. Run TypeScript & Code Linting Verification
npm run lint

# 3. Execute Production Bundle Build (Vite + esbuild)
npm run build

# 4. Verify Bundle Artifacts
ls -la dist/
# Output must contain: index.html, assets/, dist/server.cjs
```

---

## 4. Docker Containerization

### Dockerfile
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data
COPY --from=builder /app/backups ./backups

EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```

---

## 5. Google Cloud Run Deployment Steps

### Deploying via Google Cloud CLI (`gcloud`)
```bash
# 1. Build and push image to Google Artifact Registry
gcloud builds submit --tag gcr.io/alkaswa-holdings/erp-app:latest .

# 2. Deploy Service to Cloud Run
gcloud run deploy alkaswa-erp \
  --image gcr.io/alkaswa-holdings/erp-app:latest \
  --platform managed \
  --region asia-southeast1 \
  --port 3000 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --set-env-vars NODE_ENV=production,JWT_SECRET=alkaswa_enterprise_jwt_secret_key_2026_production_secure_7781,GCS_BUCKET_NAME=alkaswa-holdings-production-vault
```

---

## 6. Post-Deployment Verification & Health Checks

After deployment succeeds, verify all system endpoints:
```bash
# Health Check Endpoint
curl -I https://<your-cloud-run-url>/api/health

# Verify Data Persistence Status
curl https://<your-cloud-run-url>/api/system/status
```
