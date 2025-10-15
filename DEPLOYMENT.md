# Deployment Guide

## Prerequisites
- GitHub account with your repository pushed
- Vercel account (free)
- DigitalOcean account (with payment method)
- Gemini API key from https://makersuite.google.com/app/apikey

---

## Part 1: Deploy Backend to DigitalOcean

### Step 1: Create DigitalOcean Droplet

1. **Login to DigitalOcean**: https://cloud.digitalocean.com/
2. **Create → Droplets**
3. **Choose configuration**:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic
   - **CPU**: Regular (1 GB RAM / 1 vCPU) - $6/month
   - **Datacenter**: Choose closest to your users
   - **Authentication**: SSH Key (recommended) or Password
   - **Hostname**: `auth-detector-backend` or similar
4. Click **Create Droplet**
5. **Note the IP address** shown (e.g., 142.93.xxx.xxx)

### Step 2: Connect to Your Droplet

```bash
# SSH into your droplet (replace with your IP)
ssh root@YOUR_DROPLET_IP
```

### Step 3: Install Docker on Droplet

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Start Docker
systemctl start docker
systemctl enable docker

# Verify installation
docker --version
```

### Step 4: Install Docker Compose

```bash
# Install Docker Compose
apt install docker-compose -y

# Verify installation
docker-compose --version
```

### Step 5: Clone Your Repository

```bash
# Install git if needed
apt install git -y

# Clone your repository
cd /opt
git clone https://github.com/Namith-Telkar/getcovered_assessment.git
cd getcovered_assessment/backend
```

### Step 6: Create Environment File

```bash
# Create .env file with your Gemini API key
nano .env
```

Add this content (replace with your actual API key):
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

Save and exit (Ctrl+X, then Y, then Enter)

### Step 7: Build and Run Docker Container

```bash
# Build the Docker image
docker build -t auth-detector-backend .

# Run the container
docker run -d \
  --name auth-detector \
  --restart unless-stopped \
  -p 8000:8000 \
  --env-file .env \
  auth-detector-backend

# Check if it's running
docker ps

# View logs
docker logs auth-detector
```

### Step 8: Configure Firewall

```bash
# Allow HTTP/HTTPS and SSH
ufw allow 22
ufw allow 8000
ufw enable
```

### Step 9: Test Backend

```bash
# Test locally on the droplet
curl http://localhost:8000

# Should return: {"message":"Auth Component Detector API with Agentic Enhancement"}
```

Test from your computer:
```bash
curl http://YOUR_DROPLET_IP:8000
```

### Step 10: (Optional) Set Up Domain & SSL

If you have a domain:

```bash
# Install Nginx
apt install nginx -y

# Install Certbot for SSL
apt install certbot python3-certbot-nginx -y

# Create Nginx config
nano /etc/nginx/sites-available/auth-detector
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
    }
}
```

```bash
# Enable the site
ln -s /etc/nginx/sites-available/auth-detector /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Get SSL certificate
certbot --nginx -d api.yourdomain.com
```

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Update Frontend API URL

Update your frontend to use the backend URL:

```bash
# On your local machine, create .env file in frontend/
cd frontend
nano .env
```

Add (replace with your droplet IP or domain):
```
VITE_API_URL=http://YOUR_DROPLET_IP:8000
# OR if you set up domain with SSL:
# VITE_API_URL=https://api.yourdomain.com
```

### Step 2: Update CORS in Backend

SSH back into your droplet:
```bash
ssh root@YOUR_DROPLET_IP
cd /opt/getcovered_assessment/backend
nano main.py
```

Update the CORS origins to include your Vercel domain (you'll add this after deployment):
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://your-app.vercel.app",  # Add after Vercel deployment
        "https://*.vercel.app"  # Allow all Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Rebuild and restart:
```bash
docker stop auth-detector
docker rm auth-detector
docker build -t auth-detector-backend .
docker run -d \
  --name auth-detector \
  --restart unless-stopped \
  -p 8000:8000 \
  --env-file .env \
  auth-detector-backend
```

### Step 3: Commit Frontend Changes

```bash
# On your local machine
cd /Users/namithtelkar/Desktop/auth-detector-webapp
git add .
git commit -m "Configure for production deployment"
git push origin main
```

### Step 4: Deploy to Vercel

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with GitHub
3. Click **Add New... → Project**
4. **Import** your repository: `Namith-Telkar/getcovered_assessment`
5. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. **Environment Variables**: Click "Add"
   - **Key**: `VITE_API_URL`
   - **Value**: `http://YOUR_DROPLET_IP:8000` (or your domain)
7. Click **Deploy**

### Step 5: Get Your Vercel URL

After deployment completes:
1. Copy your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Update backend CORS (see Step 2 above) with this URL
3. Redeploy backend

### Step 6: Test Everything

1. Visit your Vercel URL
2. Try analyzing a URL (e.g., https://github.com/login)
3. Check browser console for errors
4. Verify results appear

---

## Useful Commands

### Backend (DigitalOcean)

```bash
# SSH into droplet
ssh root@YOUR_DROPLET_IP

# View logs
docker logs auth-detector

# Restart backend
docker restart auth-detector

# Stop backend
docker stop auth-detector

# Update code
cd /opt/getcovered_assessment
git pull
cd backend
docker stop auth-detector
docker rm auth-detector
docker build -t auth-detector-backend .
docker run -d --name auth-detector --restart unless-stopped -p 8000:8000 --env-file .env auth-detector-backend

# Check disk space
df -h

# Check memory
free -h
```

### Frontend (Vercel)

- Automatic deployments on git push to main branch
- View deployments: https://vercel.com/dashboard
- View logs in Vercel dashboard
- Rollback: Click on previous deployment → "Promote to Production"

---

## Troubleshooting

### Backend Issues

**Container won't start:**
```bash
docker logs auth-detector
```

**Out of memory:**
- Upgrade to 2GB droplet ($12/month)

**Port 8000 not accessible:**
```bash
ufw status
ufw allow 8000
```

**Playwright errors:**
```bash
docker exec -it auth-detector bash
playwright install chromium
```

### Frontend Issues

**Can't connect to backend:**
- Check VITE_API_URL environment variable in Vercel
- Check CORS settings in backend
- Try with droplet IP instead of domain

**Build fails:**
- Check build logs in Vercel dashboard
- Verify package.json has correct scripts
- Check for TypeScript errors

---

## Cost Estimate

- **DigitalOcean Droplet**: $6/month (1GB) or $12/month (2GB recommended)
- **Vercel**: Free
- **Domain** (optional): ~$12/year
- **Total**: $6-12/month + domain

---

## Security Recommendations

1. **Use SSH keys** instead of passwords
2. **Set up automatic updates**:
   ```bash
   apt install unattended-upgrades -y
   dpkg-reconfigure -plow unattended-upgrades
   ```
3. **Add domain with SSL** (free with Let's Encrypt)
4. **Don't expose .env file** in git
5. **Regularly update Docker images**
6. **Monitor logs** for suspicious activity
7. **Set up backups** through DigitalOcean

---

## Your URLs

After deployment, save these:
- **Backend**: `http://YOUR_DROPLET_IP:8000` or `https://api.yourdomain.com`
- **Frontend**: `https://your-app.vercel.app`
- **GitHub Repo**: `https://github.com/Namith-Telkar/getcovered_assessment`
