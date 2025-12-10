# Vercel Deployment Guide

This guide will help you deploy the dashboard to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free tier available)
2. **GitHub/GitLab/Bitbucket Account**: Your code should be in a Git repository
3. **Supabase Credentials**: Your Supabase URL and anon key

## Step 1: Prepare Your Repository

Make sure your dashboard code is in a Git repository (GitHub, GitLab, or Bitbucket).

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"

2. **Import Your Repository**
   - Connect your Git provider (GitHub, GitLab, or Bitbucket)
   - Select your repository
   - Choose the `dashboard` folder as the root directory

3. **Configure Project Settings**
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `dashboard` (if not already set)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Set Environment Variables**
   - Click "Environment Variables"
   - Add the following:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
     ```
   - Make sure to add them for all environments:
     - Production
     - Preview
     - Development

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 2-3 minutes)

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to Dashboard Directory**
   ```bash
   cd dashboard
   ```

4. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No** (for first deployment)
   - Project name? (Press Enter for default)
   - Directory? `./` (current directory)
   - Override settings? **No**

5. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   # Enter your Supabase URL when prompted
   
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   # Enter your anon key when prompted
   ```

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Step 3: Configure Custom Domain (Optional)

1. **Add Domain in Vercel**
   - Go to your project settings
   - Click "Domains"
   - Add your custom domain (e.g., `dashboard.yourdomain.com`)

2. **Update DNS**
   - Add a CNAME record pointing to `cname.vercel-dns.com`
   - Or add A records as instructed by Vercel

3. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - Wait for DNS propagation (usually 5-10 minutes)

## Step 4: Verify Deployment

1. **Check Build Logs**
   - Go to your project in Vercel dashboard
   - Check "Deployments" tab
   - Verify build completed successfully

2. **Test Your Dashboard**
   - Visit your deployment URL (e.g., `your-project.vercel.app`)
   - Test login functionality
   - Verify all features work correctly

## Environment Variables

Make sure these are set in Vercel:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | `eyJhbGci...` |

## Troubleshooting

### Build Fails

1. **Check Build Logs**
   - Look for error messages in Vercel dashboard
   - Common issues:
     - Missing environment variables
     - TypeScript errors
     - Missing dependencies

2. **Fix Issues Locally**
   ```bash
   cd dashboard
   npm install
   npm run build
   ```
   - Fix any errors locally first
   - Commit and push changes

### Environment Variables Not Working

1. **Verify Variables Are Set**
   - Check Vercel dashboard → Settings → Environment Variables
   - Ensure they're set for the correct environment (Production/Preview/Development)

2. **Redeploy After Adding Variables**
   - Environment variables require a new deployment
   - Trigger a new deployment after adding variables

### Dashboard Not Loading

1. **Check Supabase Connection**
   - Verify Supabase URL and key are correct
   - Check Supabase project is active
   - Test connection from browser console

2. **Check RLS Policies**
   - Ensure Row Level Security policies allow access
   - Test with a test user account

## Continuous Deployment

Vercel automatically deploys when you push to your Git repository:

- **Production**: Deploys from `main` or `master` branch
- **Preview**: Deploys from other branches and pull requests

## Updating Your Deployment

1. **Make Changes**
   - Edit your code locally
   - Test changes

2. **Commit and Push**
   ```bash
   git add .
   git commit -m "Update dashboard"
   git push
   ```

3. **Automatic Deployment**
   - Vercel automatically detects the push
   - Builds and deploys your changes
   - You'll get a notification when complete

## Monitoring

- **Analytics**: View in Vercel dashboard
- **Logs**: Check function logs in Vercel dashboard
- **Performance**: Monitor in Vercel dashboard → Analytics

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

## Quick Deploy Commands

```bash
# First deployment
cd dashboard
vercel

# Deploy to production
vercel --prod

# View deployments
vercel ls

# View logs
vercel logs
```

Your dashboard is now live on Vercel! 🚀

