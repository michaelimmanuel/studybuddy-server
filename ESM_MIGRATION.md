# ES Module Migration - Better Auth Compatibility Fix

## Problem
The error `ERR_REQUIRE_ESM` occurs because `better-auth` uses ES Modules (`@noble/ciphers`), but the project was compiled to CommonJS. This is incompatible with serverless environments like AWS Lambda/Vercel.

## Solution Applied
Converted the project from CommonJS to ES Modules (ESM).

## Changes Made

### 1. `package.json`
- Added `"type": "module"` to enable ES Modules

### 2. `tsconfig.json`
- Changed `"module": "CommonJS"` to `"module": "ESNext"`
- Added `"moduleResolution": "node"`

### 3. `scripts/switch-db.js`
- Updated from `require()` to `import` syntax
- Added `__dirname` polyfill for ES Modules

## Deployment Steps

### For Vercel/Serverless Platforms

1. **Clean and rebuild:**
   ```bash
   rm -rf node_modules dist
   npm install
   npm run build
   ```

2. **Test locally:**
   ```bash
   npm run dev
   ```

3. **Deploy:**
   - Commit and push changes
   - Vercel will automatically redeploy

### Environment Variables (Production)
Ensure these are set in your deployment platform:
- `NODE_ENV=production`
- `DATABASE_URL_PROD=<your-production-db-url>`
- `BETTER_AUTH_URL=https://api.studybuddy.com` (or your actual API URL)
- `BETTER_AUTH_SECRET=<your-secret>`

### Additional Configuration (if needed)

If you're using **Vercel**, create a `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.ts"
    }
  ]
}
```

If you're using **AWS Lambda**, ensure your handler is exported correctly and consider using a bundler like `esbuild` or `tsup` that handles ESM properly.

## Verification

After deployment, check:
1. ✅ Server starts without `ERR_REQUIRE_ESM` error
2. ✅ Auth endpoints work (`/api/auth/*`)
3. ✅ Database connections work
4. ✅ API routes respond correctly

## Troubleshooting

### If you still get module errors:
1. Clear build cache: `rm -rf dist node_modules package-lock.json`
2. Reinstall: `npm install`
3. Rebuild: `npm run build`

### If deployment platform doesn't support ESM:
Consider using a bundler to create a single CommonJS bundle:
```bash
npm install -D esbuild
```

Add to `package.json`:
```json
"scripts": {
  "bundle": "esbuild src/server.ts --bundle --platform=node --target=node18 --outfile=dist/server.cjs --format=cjs --external:@prisma/client"
}
```

## Rollback (if needed)
1. Revert `package.json`: Remove `"type": "module"`
2. Revert `tsconfig.json`: Change back to `"module": "CommonJS"`
3. Revert `scripts/switch-db.js`: Use `require()` instead of `import`
4. Downgrade `better-auth` or use a bundler approach
