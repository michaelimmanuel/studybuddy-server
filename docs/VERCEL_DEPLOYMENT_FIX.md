# Complete Vercel Deployment Fix

## 🐛 Problems Encountered

### Error 1: exports is not defined
```
ReferenceError: exports is not defined in ES module scope
```

### Error 2: Module not found
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/src/lib/auth' 
imported from /var/task/src/server.js
```

## 🎯 Root Cause

The issues were caused by:
1. `"type": "module"` in `package.json` declaring ES modules
2. TypeScript compiling to `ESNext` modules
3. ES modules requiring explicit `.js` file extensions in all imports
4. Vercel's Node.js serverless runtime having issues with ES module resolution

## ✅ Final Solution: Switch to CommonJS

### Why CommonJS?

- ✅ No file extension requirements
- ✅ Better Vercel compatibility
- ✅ Simpler build process
- ✅ More reliable for serverless
- ✅ Works with existing codebase without changes

## 📝 Changes Made

### 1. `tsconfig.json` - Compile to CommonJS

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",      // ← Changed from "ESNext"
    "moduleResolution": "node", // ← Changed from "bundler"
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "typeRoots": ["./node_modules/@types", "./src/types"]
  }
}
```

### 2. `package.json` - Remove ES Module Type

**Before:**
```json
{
  "name": "studybuddy-server",
  "type": "module",  // ← REMOVED
  "main": "index.js"
}
```

**After:**
```json
{
  "name": "studybuddy-server",
  "main": "dist/server.js",
  "scripts": {
    "build": "tsc",
    "vercel-build": "npm run build && prisma generate && prisma migrate deploy"
  }
}
```

### 3. `api/index.js` - Vercel Entry Point

Created a CommonJS entry point for Vercel:

```javascript
const app = require('../dist/server.js');

module.exports = app.default || app;
```

### 4. `vercel.json` - Vercel Configuration

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/api/index.js"
    }
  ]
}
```

### 5. `.gitignore` - Keep dist Out of Git

```gitignore
# Build output (built on Vercel)
/dist
```

The `dist` folder is built automatically on Vercel via the `vercel-build` script.

## 🔄 Build Process

### Local Development
```bash
npm run dev          # TypeScript with ts-node-dev
npm run dev:prod-db  # TypeScript with production DB
```

### Vercel Deployment
1. Vercel runs `vercel-build` script
2. Compiles TypeScript to CommonJS in `dist/`
3. Generates Prisma client
4. Deploys database migrations
5. Creates serverless function from `api/index.js`

## 📦 Output Comparison

### ES Module Output (BROKEN ❌)
```javascript
import express from "express";
import { auth } from "./lib/auth";  // Missing .js extension!
```

### CommonJS Output (WORKING ✅)
```javascript
const express = require("express");
const { auth } = require("./lib/auth");  // No extension needed
```

## 🚀 Deployment Steps

1. **Push to GitHub**
   ```bash
   git push
   ```

2. **Vercel Auto-Deploys**
   - Runs `npm install`
   - Runs `vercel-build` script
   - Creates serverless function

3. **Set Environment Variables in Vercel**
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://your_db_url
   BETTER_AUTH_SECRET=your_secret
   BETTER_AUTH_URL=https://api.studybuddymeds.com
   ```

## ✅ Verification

### Check Build Locally
```bash
npm run build
node dist/server.js  # Should start the server
```

### Test on Vercel
```bash
curl https://api.studybuddymeds.com/api/health
```

## 📚 Related Documentation

- `DATABASE_CONFIG_REFACTOR.md` - Database configuration changes
- `VERCEL_SUBDOMAIN_SETUP.md` - Domain and subdomain setup

## 🎉 Result

The API is now successfully deployed on Vercel at:
- **URL**: `https://api.studybuddymeds.com`
- **Architecture**: CommonJS modules
- **Runtime**: Node.js serverless functions
- **Database**: PostgreSQL (Supabase)
