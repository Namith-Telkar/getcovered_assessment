# Quick Deployment Checklist

## Before You Start
- [ ] GitHub repository pushed: https://github.com/Namith-Telkar/getcovered_assessment
- [ ] Gemini API key ready: https://makersuite.google.com/app/apikey
- [ ] DigitalOcean account created
- [ ] Vercel account created (sign in with GitHub)

## Part 1: Backend on DigitalOcean (20-30 mins)

### 1. Create Droplet
- [ ] Login to https://cloud.digitalocean.com/
- [ ] Create → Droplets
- [ ] Ubuntu 22.04 LTS, Basic plan, 1GB RAM ($6/month)
- [ ] Choose datacenter region
- [ ] Set up SSH key or password
- [ ] Create droplet
- [ ] **Save your droplet IP: ________________**

### 2. Connect & Install Docker
```bash
ssh root@YOUR_DROPLET_IP
apt update && apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt install docker-compose git -y
```

### 3. Deploy Backend
```bash
cd /opt
git clone https://github.com/Namith-Telkar/getcovered_assessment.git
cd getcovered_assessment/backend

# Create .env file
nano .env
# Add: GEMINI_API_KEY=your_actual_api_key_here
# Save: Ctrl+X, Y, Enter

# Build and run
docker build -t auth-detector-backend .
docker run -d --name auth-detector --restart unless-stopped -p 8000:8000 --env-file .env auth-detector-backend

# Configure firewall
ufw allow 22
ufw allow 8000
ufw enable
```

### 4. Test Backend
```bash
curl http://YOUR_DROPLET_IP:8000
# Should return: {"message":"Auth Component Detector API..."}
```

- [ ] Backend is running
- [ ] **Backend URL: http://________________:8000**

## Part 2: Frontend on Vercel (5-10 mins)

### 1. Update Local Code
```bash
# On your local machine
cd /Users/namithtelkar/Desktop/auth-detector-webapp/frontend

# Create .env file
echo "VITE_API_URL=http://YOUR_DROPLET_IP:8000" > .env

# Commit changes
cd ..
git add .
git commit -m "Add deployment configuration"
git push origin main
```

### 2. Deploy to Vercel
- [ ] Go to https://vercel.com
- [ ] Sign in with GitHub
- [ ] Click "Add New... → Project"
- [ ] Import: `Namith-Telkar/getcovered_assessment`
- [ ] Configure:
  - Framework: Vite
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] Add Environment Variable:
  - Key: `VITE_API_URL`
  - Value: `http://YOUR_DROPLET_IP:8000`
- [ ] Click Deploy
- [ ] **Save Vercel URL: https://________________.vercel.app**

### 3. Update Backend CORS (Optional but Recommended)
```bash
ssh root@YOUR_DROPLET_IP
cd /opt/getcovered_assessment/backend
nano .env
# Add line: FRONTEND_URL=https://your-app.vercel.app

# Restart container
docker restart auth-detector
```

## Part 3: Test Complete Setup

- [ ] Visit your Vercel URL
- [ ] Try Getcovered example: https://www.getcoveredinsurance.com/auth/login
- [ ] Try Instagram: https://instagram.com/accounts/login
- [ ] Try GitHub: https://github.com/login
- [ ] Check browser console for errors
- [ ] Verify results display correctly

## Your Deployed URLs

📝 **Save these for your records:**

- **Frontend**: https://________________.vercel.app
- **Backend**: http://________________:8000
- **GitHub**: https://github.com/Namith-Telkar/getcovered_assessment
- **DigitalOcean Droplet IP**: ________________

## Cost

- DigitalOcean: $6/month (1GB droplet)
- Vercel: FREE
- **Total: $6/month**

## Troubleshooting

### Backend not responding
```bash
ssh root@YOUR_DROPLET_IP
docker logs auth-detector
docker restart auth-detector
```

### Frontend can't connect
- Check VITE_API_URL in Vercel environment variables
- Verify backend is running: `curl http://YOUR_DROPLET_IP:8000`
- Check CORS settings in backend

### See full guide
Read `DEPLOYMENT.md` for detailed instructions and troubleshooting

## Updating Your App

### Update Backend
```bash
ssh root@YOUR_DROPLET_IP
cd /opt/getcovered_assessment
git pull
cd backend
docker stop auth-detector && docker rm auth-detector
docker build -t auth-detector-backend .
docker run -d --name auth-detector --restart unless-stopped -p 8000:8000 --env-file .env auth-detector-backend
```

### Update Frontend
```bash
# Just push to GitHub - Vercel auto-deploys
git add .
git commit -m "Update frontend"
git push origin main
```
