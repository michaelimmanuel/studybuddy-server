# Vercel Subdomain Setup Guide

This guide explains how to set up `api.studybuddymeds.com` subdomain for your StudyBuddy API server on Vercel.

## 🎯 Overview

- **Main Domain**: `studybuddymeds.com` (Frontend)
- **API Subdomain**: `api.studybuddymeds.com` (Backend)

## 📋 Step-by-Step Setup

### Step 1: Add Domain in Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **studybuddy-server** project
3. Navigate to **Settings** → **Domains**
4. In the "Add Domain" field, enter: `api.studybuddymeds.com`
5. Click **Add**
6. Vercel will show you DNS configuration instructions

### Step 2: Configure DNS Records

Go to your domain provider (GoDaddy, Namecheap, Cloudflare, etc.) where you registered `studybuddymeds.com`:

**Option A: CNAME Record (Recommended)**
```
Type: CNAME
Name: api
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

**Option B: A Record**
```
Type: A
Name: api
Value: 76.76.21.21
TTL: 3600 (or Auto)
```

**Note**: Use the exact values Vercel provides in the dashboard, as they may vary.

### Step 3: Set Environment Variables in Vercel

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add the following variables for **Production** environment:

```env
BETTER_AUTH_URL=https://api.studybuddymeds.com
NODE_ENV=production
DATABASE_URL_PROD=your_production_database_url
BETTER_AUTH_SECRET=your_secret_key
```

**Important**: Make sure to select **Production** for the environment!

### Step 4: Deploy to Vercel

```bash
# Commit your changes
git add .
git commit -m "Configure subdomain support for api.studybuddymeds.com"
git push

# Vercel will automatically deploy if you have GitHub integration
# Or deploy manually:
vercel --prod
```

### Step 5: Update Frontend API URL

Update your frontend (`studybuddy-web`) to use the new API URL:

```typescript
// In your API configuration file
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.studybuddymeds.com'
  : 'http://localhost:8000';
```

## 🔍 Verification

After DNS propagation (usually 5-60 minutes), verify:

1. **Check DNS**: 
   ```bash
   nslookup api.studybuddymeds.com
   ```

2. **Test API Health**:
   ```bash
   curl https://api.studybuddymeds.com/api/health
   ```

3. **Test Auth Endpoint**:
   ```bash
   curl https://api.studybuddymeds.com/api/auth/get-session
   ```

## 🎨 Architecture

```
┌─────────────────────────────────────┐
│     studybuddymeds.com             │
│     (Frontend - Next.js)            │
└─────────────┬───────────────────────┘
              │
              │ API Calls
              │
              ▼
┌─────────────────────────────────────┐
│  api.studybuddymeds.com            │
│  (Backend - Express + Prisma)       │
└─────────────┬───────────────────────┘
              │
              │ Database Queries
              │
              ▼
┌─────────────────────────────────────┐
│     PostgreSQL Database             │
│     (Supabase)                      │
└─────────────────────────────────────┘
```

## 🔐 Security Considerations

1. **CORS**: Already configured to allow requests from:
   - `https://studybuddymeds.com`
   - `https://www.studybuddymeds.com`
   - `https://api.studybuddymeds.com`

2. **Cookies**: Domain set to `.studybuddymeds.com` (with leading dot) to allow sharing between subdomains

3. **HTTPS**: Always enforced in production

## 🐛 Troubleshooting

### DNS Not Resolving
- Wait up to 24 hours for DNS propagation
- Clear your DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (macOS)
- Use [DNS Checker](https://dnschecker.org/) to verify propagation

### CORS Errors
- Ensure environment variables are set correctly in Vercel
- Check that cookies are configured with the correct domain
- Verify `credentials: true` is set in both server and client

### SSL Certificate Issues
- Vercel automatically provisions SSL certificates
- Wait a few minutes after adding the domain
- Check Vercel dashboard for certificate status

### 401 Unauthorized Errors
- Verify `BETTER_AUTH_URL` environment variable is set correctly
- Check that cookies are being sent with requests
- Ensure `sameSite: "none"` is set for cross-domain cookies

## 📚 Additional Resources

- [Vercel Domains Documentation](https://vercel.com/docs/concepts/projects/domains)
- [Better Auth Documentation](https://www.better-auth.com/)
- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

## ✅ Checklist

- [ ] Domain added in Vercel Dashboard
- [ ] DNS records configured
- [ ] Environment variables set in Vercel
- [ ] Code updated and deployed
- [ ] Frontend API URL updated
- [ ] Health check endpoint responding
- [ ] Auth endpoints working
- [ ] CORS working correctly
- [ ] Cookies being set/sent properly
