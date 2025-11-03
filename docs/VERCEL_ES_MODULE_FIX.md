# Vercel ES Module Fix

## Problem
```
ReferenceError: exports is not defined in ES module scope
```

This error occurred because:
1. `package.json` has `"type": "module"` (ES modules)
2. TypeScript was compiling to ES modules
3. Vercel's Node.js runtime needs the app exported properly for serverless functions

## Solution Applied

### 1. Updated `vercel.json`
Changed from building dist files to using TypeScript source directly:

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

### 2. Updated `src/server.ts`
- Only starts the server in development mode
- Exports the Express app for Vercel's serverless environment

```typescript
// For local development only
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        // ...
    });
}

// Export for Vercel serverless
export default app;
```

### 3. Added `vercel-build` Script
Added to `package.json` to handle Prisma setup during Vercel deployment:

```json
"vercel-build": "prisma generate && prisma migrate deploy"
```

## Environment Variables Required in Vercel

Make sure these are set in your Vercel project (Settings → Environment Variables):

```env
NODE_ENV=production
DATABASE_URL_PROD=postgresql://postgres.fgefagkulowrzilpusne:Michael241203@@##@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
BETTER_AUTH_URL=https://api.studybuddymeds.com
BETTER_AUTH_SECRET=cMs4FARE1aoJhSiRq56yTOOQqcTeVUWx
```

**Important Notes:**
- Vercel will automatically set `NODE_ENV=production` for production deployments
- The `DATABASE_URL_PROD` will be used automatically in production (see `database-config.ts`)
- Make sure to add these to the **Production** environment in Vercel

## How Vercel Serverless Works

1. Vercel reads `vercel.json` configuration
2. Builds the TypeScript file using `@vercel/node`
3. Creates a serverless function from your exported Express app
4. Each request triggers the serverless function
5. The function handles the request and returns a response

## Testing Locally

Your local development still works the same way:

```bash
npm run dev          # Development with local DB
npm run dev:prod-db  # Development with production DB
```

## Deployment

Just push to your repository:

```bash
git add .
git commit -m "Fix ES module error for Vercel deployment"
git push
```

Vercel will automatically deploy if you have GitHub integration enabled.

## Verification After Deployment

1. Check Vercel deployment logs
2. Test the health endpoint:
   ```bash
   curl https://api.studybuddymeds.com/api/health
   ```
3. Test authentication:
   ```bash
   curl https://api.studybuddymeds.com/api/auth/get-session
   ```

## Additional Configuration

If you need to configure serverless function settings, you can add to `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node",
      "config": {
        "maxDuration": 10
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.ts"
    }
  ],
  "functions": {
    "src/server.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

## Troubleshooting

### If you still get module errors:
1. Clear Vercel build cache in dashboard
2. Redeploy
3. Check environment variables are set correctly

### If database connection fails:
1. Ensure `DATABASE_URL_PROD` is set in Vercel
2. Check that your database allows connections from Vercel's IP ranges
3. Verify the connection string format

### If auth doesn't work:
1. Ensure `BETTER_AUTH_URL` matches your domain
2. Check cookie domain settings in `auth.ts`
3. Verify CORS origins include your frontend domain
