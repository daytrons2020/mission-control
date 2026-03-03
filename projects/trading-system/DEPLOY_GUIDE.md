# Deploy BINARY Trading Dashboard to Website

## Option 1: GitHub Pages (FREE + Custom Domain)

### Step 1: Create GitHub Repository
1. Go to <https://github.com/new>
2. Name: `trading-dashboard`
3. Make it Public
4. Create repository

### Step 2: Upload Files
```bash
cd /root/.openclaw/workspace/projects/trading-system

# Initialize git
git init
git add frontend/
git commit -m "Initial trading dashboard"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/trading-dashboard.git
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: main / root
4. Save

### Step 4: Your Website
- **URL**: `https://YOUR_USERNAME.github.io/trading-dashboard`
- **Custom Domain**: Add your domain in Settings → Pages → Custom domain

---

## Option 2: Netlify (FREE + HTTPS)

### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

### Step 2: Deploy
```bash
cd /root/.openclaw/workspace/projects/trading-system/frontend
netlify deploy --prod --dir=.
```

### Step 3: Custom Domain
1. Go to Netlify dashboard
2. Site settings → Domain management
3. Add custom domain
4. Configure DNS

---

## Option 3: Vercel (FREE + HTTPS)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
cd /root/.openclaw/workspace/projects/trading-system/frontend
vercel --prod
```

---

## Option 4: Cloudflare Pages (FREE + CDN)

### Step 1: Install Wrangler
```bash
npm install -g wrangler
```

### Step 2: Deploy
```bash
cd /root/.openclaw/workspace/projects/trading-system/frontend
wrangler pages publish . --project-name=trading-dashboard
```

---

## Option 5: Keep Current Server + Add Domain

### Buy Domain (Namecheap/Cloudflare)
- `yourtrading.com` or similar
- ~$10-15/year

### Point Domain to Server
```
A Record: yourtrading.com → 8.219.242.108
```

### Add HTTPS with Let's Encrypt
```bash
# Install certbot
apt install certbot python3-certbot-nginx

# Get SSL certificate
certbot certonly --standalone -d yourtrading.com

# Auto-renew
certbot renew --dry-run
```

### Setup Nginx Reverse Proxy
```bash
apt install nginx
```

Create `/etc/nginx/sites-available/trading`:
```nginx
server {
    listen 80;
    server_name yourtrading.com www.yourtrading.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /ws {
        proxy_pass http://localhost:8765;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

server {
    listen 443 ssl;
    server_name yourtrading.com www.yourtrading.com;
    
    ssl_certificate /etc/letsencrypt/live/yourtrading.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourtrading.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable:
```bash
ln -s /etc/nginx/sites-available/trading /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## Recommended: GitHub Pages (Easiest)

**Pros:**
- ✅ Completely FREE
- ✅ HTTPS included
- ✅ Custom domain support
- ✅ CDN worldwide
- ✅ No server maintenance

**Cons:**
- Static files only (no WebSocket)
- Need to poll for updates

### For Real-Time with GitHub Pages

Modify `frontend/index.html` to use polling instead of WebSocket:

```javascript
// Replace WebSocket with polling
function startPolling() {
    setInterval(async () => {
        try {
            const response = await fetch('https://your-backend-server.com/api/data');
            const data = await response.json();
            handleData(data);
        } catch (e) {
            console.error('Poll error:', e);
        }
    }, 5000); // Poll every 5 seconds
}
```

---

## Quick Start: Deploy Now

Want me to:

1. **Package for GitHub Pages** (zip file you can upload)
2. **Setup Cloudflare Tunnel** (free, no domain needed)
3. **Configure Nginx + SSL** on current server
4. **Create Docker container** for easy deployment

Which option do you prefer?
