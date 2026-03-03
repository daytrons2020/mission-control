# GitHub + Vercel Setup Guide

## Quick Setup (5 minutes)

### Step 1: GitHub Authentication
```bash
gh auth login
# Follow prompts to authenticate with browser
```

### Step 2: Create Repository & Push
```bash
./scripts/setup_vercel_deploy.sh
```

### Step 3: Connect to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy!
vercel --prod
```

---

## Alternative: Manual Setup

### Option A: GitHub Web Interface

1. Go to https://github.com/new
2. Repository name: `mission-control`
3. Make it **Public**
4. Click **Create repository**
5. Follow "push an existing repository" instructions:

```bash
cd /Users/daytrons/.openclaw/workspace
git remote add origin https://github.com/YOUR_USERNAME/mission-control.git
git branch -M main
git push -u origin main
```

### Option B: Vercel Web Interface

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Framework preset: **Other**
4. Root directory: `./`
5. Build command: (leave empty)
6. Output directory: (leave empty)
7. Click **Deploy**

---

## Auto-Deploy Configuration

Once connected, Vercel will:
- Auto-deploy on every `git push`
- Provide preview URLs for pull requests
- Support custom domains (settings → domains)

---

## Current Status

**GitHub CLI:** Installed but not authenticated
**Repository:** Not yet created
**Vercel:** Not yet connected

**Next Action:** Run `gh auth login` then `./scripts/setup_vercel_deploy.sh`
