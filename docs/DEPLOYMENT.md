# GreenDye Academy Deployment Guide

This guide explains how to deploy the GreenDye Academy platform on a VPS with Ubuntu 22.04 and Hestia Control Panel v1.9.4.

> **🆕 Looking for a complete VPS setup guide?**  
> Check out our comprehensive [VPS Installation Guide](VPS_INSTALLATION.md) for step-by-step instructions from fresh Ubuntu server to running application, including security, SSL certificates, backups, and monitoring.

## Prerequisites

- VPS with Ubuntu 22.04
- Hestia Control Panel v1.9.4 installed
- Domain name pointed to your VPS
- Root or sudo access

## Deployment Methods

### Method 1: Docker Deployment (Recommended)

1. **Install Docker and Docker Compose**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Clone the Repository**

```bash
cd /home/admin/web/your-domain.com/
git clone https://github.com/mohamedaseleim/GreenDye.git
cd GreenDye
```

3. **Configure Environment Variables**

```bash
cd backend
cp .env.example .env
nano .env
```

Update the following variables:
- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_URL`
- SMTP settings for email
- Other API keys as needed

4. **Build and Start Services**

```bash
cd ..
docker-compose up -d
```

5. **Verify Deployment**

```bash
docker-compose ps
docker-compose logs -f
```

### Method 2: Manual Deployment with Hestia

1. **Install Node.js**

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Install MongoDB**

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

3. **Deploy Backend**

```bash
cd /home/admin/web/your-domain.com/
git clone https://github.com/mohamedaseleim/GreenDye.git
cd GreenDye/backend
npm install
cp .env.example .env
nano .env  # Configure environment variables
```

4. **Install PM2 (Process Manager)**

```bash
sudo npm install -g pm2
pm2 start server.js --name greendye-backend
pm2 save
pm2 startup
```

5. **Deploy Frontend**

```bash
cd ../frontend
npm install
npm run build
```

6. **Configure Nginx in Hestia**

Create a new web domain in Hestia Control Panel and configure reverse proxy:

```nginx
location /api {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

location / {
    root /home/admin/web/your-domain.com/GreenDye/frontend/build;
    try_files $uri $uri/ /index.html;
}
```

## SSL Certificate

### Using Let's Encrypt with Hestia

1. Go to Hestia Control Panel
2. Navigate to WEB → your domain
3. Click "SSL Support"
4. Select "Let's Encrypt" and click "Save"

### Manual SSL Configuration

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Database Backup

Create automatic backup script:

```bash
#!/bin/bash
BACKUP_DIR="/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
mongodump --out $BACKUP_DIR/backup_$DATE
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
```

Add to crontab:
```bash
0 2 * * * /path/to/backup-script.sh
```

## Monitoring

### Check Application Status

```bash
# Docker deployment
docker-compose ps
docker-compose logs -f backend
docker-compose logs -f frontend

# Manual deployment
pm2 status
pm2 logs greendye-backend
```

### Monitor Resources

```bash
htop
df -h
free -m
```

## Updating the Application

### Docker Deployment

```bash
cd /path/to/GreenDye
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

### Manual Deployment

```bash
cd /path/to/GreenDye
git pull

# Update backend
cd backend
npm install
pm2 restart greendye-backend

# Update frontend
cd ../frontend
npm install
npm run build
```

## Troubleshooting

### Backend not starting

```bash
# Check logs
pm2 logs greendye-backend
# or
docker-compose logs backend

# Check MongoDB connection
mongo --eval "db.adminCommand('ping')"
```

### Frontend not displaying

```bash
# Check nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Database connection issues

```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

## Security Recommendations

1. **Firewall Configuration**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

2. **MongoDB Security**
- Enable authentication
- Use strong passwords
- Bind to localhost only (if on same server)

3. **Application Security**
- Keep dependencies updated
- Use strong JWT_SECRET
- Enable rate limiting
- Regular security audits

## Performance Optimization

1. **Enable Caching**
- Configure Redis for session storage
- Enable browser caching in nginx

2. **Database Optimization**
- Create proper indexes
- Regular database maintenance
- Monitor slow queries

3. **CDN Integration**
- Use CDN for static assets
- Optimize images

## Support

For issues and questions:
- GitHub Issues: https://github.com/mohamedaseleim/GreenDye/issues
- Email: support@greendye-academy.com
