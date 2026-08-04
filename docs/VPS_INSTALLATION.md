# Complete Guide to Install GreenDye Academy on VPS

This comprehensive guide will walk you through installing GreenDye Academy on a Virtual Private Server (VPS) from scratch. Whether you're using a fresh Ubuntu server or have Hestia Control Panel installed, this guide covers everything you need.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Step 1: Get and Setup Your VPS](#step-1-get-and-setup-your-vps)
- [Step 2: Initial Server Configuration](#step-2-initial-server-configuration)
- [Step 3: Install Dependencies](#step-3-install-dependencies)
- [Step 4: Install and Configure MongoDB](#step-4-install-and-configure-mongodb)
- [Step 5: Clone and Configure the Application](#step-5-clone-and-configure-the-application)
- [Step 6: Deploy Backend](#step-6-deploy-backend)
- [Step 7: Deploy Frontend](#step-7-deploy-frontend)
- [Step 8: Configure Nginx Web Server](#step-8-configure-nginx-web-server)
- [Step 9: Setup SSL Certificate](#step-9-setup-ssl-certificate)
- [Step 10: Configure Firewall](#step-10-configure-firewall)
- [Step 11: Setup Automatic Backups](#step-11-setup-automatic-backups)
- [Step 12: Configure Monitoring](#step-12-configure-monitoring)
- [Troubleshooting](#troubleshooting)
- [Maintenance and Updates](#maintenance-and-updates)
- [Security Best Practices](#security-best-practices)

---

## Prerequisites

Before you begin, you'll need:

### 1. VPS Requirements
- **Operating System**: Ubuntu 22.04 LTS (recommended) or Ubuntu 20.04 LTS
- **RAM**: Minimum 2GB (4GB recommended for production)
- **Storage**: Minimum 20GB SSD (50GB+ recommended)
- **CPU**: Minimum 1 vCPU (2+ vCPUs recommended)
- **Network**: Public IP address

### 2. Domain Name
- A registered domain name (e.g., yoursite.com)
- Access to DNS management for your domain
- Domain pointed to your VPS IP address

### 3. Access Requirements
- SSH access to your VPS (root or sudo user)
- SSH client (Terminal on Mac/Linux, PuTTY on Windows)
- Basic command line knowledge

### 4. VPS Provider Recommendations
- DigitalOcean (recommended)
- Linode
- Vultr
- AWS Lightsail
- Hetzner
- Any VPS provider with Ubuntu support

---

## Step 1: Get and Setup Your VPS

### 1.1 Choose a VPS Provider

For this guide, we'll use general instructions that work with any provider. Here's how to get started:

**Example with DigitalOcean:**
1. Create an account at https://www.digitalocean.com
2. Create a new Droplet
3. Choose Ubuntu 22.04 LTS
4. Select a plan (minimum $12/month for 2GB RAM)
5. Choose a datacenter region close to your users
6. Add your SSH key or use password authentication
7. Create the Droplet

### 1.2 Get Your VPS IP Address

After creating your VPS, note down:
- **IP Address**: (e.g., 192.0.2.100)
- **Root password** (if you didn't use SSH keys)

### 1.3 Point Your Domain to VPS

In your domain registrar's DNS settings, create an A record:
```
Type: A
Name: @ (or your domain)
Value: YOUR_VPS_IP_ADDRESS
TTL: 3600

Type: A
Name: www
Value: YOUR_VPS_IP_ADDRESS
TTL: 3600
```

Wait 10-30 minutes for DNS propagation.

### 1.4 Connect to Your VPS

**On Mac/Linux:**
```bash
ssh root@YOUR_VPS_IP_ADDRESS
```

**On Windows:**
- Download and install PuTTY
- Enter your VPS IP address
- Click "Open" and login with your credentials

---

## Step 2: Initial Server Configuration

Once connected to your VPS, let's secure and configure it.

### 2.1 Update System Packages

```bash
# Update package list
sudo apt update

# Upgrade installed packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential software-properties-common
```

### 2.2 Create a New User (Optional but Recommended)

Instead of using root, create a dedicated user:

```bash
# Create new user
adduser greendye

# Add user to sudo group
usermod -aG sudo greendye

# Switch to new user
su - greendye
```

### 2.3 Set Timezone

```bash
# Set timezone (adjust to your location)
sudo timedatectl set-timezone Africa/Cairo

# Verify
timedatectl
```

### 2.4 Configure Hostname

```bash
# Set hostname
sudo hostnamectl set-hostname greendye-academy

# Update hosts file
sudo nano /etc/hosts
```

Add this line:
```
127.0.0.1 greendye-academy
```

---

## Step 3: Install Dependencies

### 3.1 Install Node.js (v18 LTS)

```bash
# Install Node.js 18.x repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js and npm
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show v9.x.x or higher
```

### 3.2 Install PM2 Process Manager

PM2 will keep your application running and restart it if it crashes:

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### 3.3 Install Nginx Web Server

```bash
# Install Nginx
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

Visit your domain in a browser - you should see the Nginx welcome page.

---

## Step 4: Install and Configure MongoDB

### 4.1 Install MongoDB

```bash
# Import MongoDB GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package list
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod

# Enable MongoDB to start on boot
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

### 4.2 Secure MongoDB

```bash
# Connect to MongoDB shell
mongosh

# In MongoDB shell, create admin user
use admin
db.createUser({
  user: "admin",
  pwd: "YOUR_STRONG_PASSWORD_HERE",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
})

# Create application database and user
use greendye
db.createUser({
  user: "greendye_user",
  pwd: "YOUR_APP_PASSWORD_HERE",
  roles: [ { role: "readWrite", db: "greendye" } ]
})

# Exit MongoDB shell
exit
```

### 4.3 Enable MongoDB Authentication

```bash
# Edit MongoDB configuration
sudo nano /etc/mongod.conf
```

Find the `#security:` section and modify it:
```yaml
security:
  authorization: enabled
```

Restart MongoDB:
```bash
sudo systemctl restart mongod
```

---

## Step 5: Clone and Configure the Application

### 5.1 Choose Installation Directory

```bash
# Create application directory
sudo mkdir -p /var/www/greendye
sudo chown -R $USER:$USER /var/www/greendye
cd /var/www/greendye
```

### 5.2 Clone Repository

```bash
# Clone the GreenDye repository
git clone https://github.com/mohamedaseleim/GreenDye.git
cd GreenDye
```

### 5.3 Install Backend Dependencies

```bash
cd backend
npm install --production
```

### 5.4 Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit environment file
nano .env
```

Configure these essential variables:
```env
# Server Configuration
NODE_ENV=production
PORT=5000
API_URL=https://your-domain.com

# Database
MONGODB_URI=mongodb://greendye_user:YOUR_APP_PASSWORD_HERE@localhost:27017/greendye

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@your-domain.com
FROM_NAME=GreenDye Academy

# File Upload
MAX_FILE_SIZE=10485760
FILE_UPLOAD_PATH=/var/www/greendye/GreenDye/backend/uploads

# Frontend URL
FRONTEND_URL=https://your-domain.com

# Security
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Payment Gateways (Optional - configure if needed)
# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLIC_KEY=
STRIPE_WEBHOOK_SECRET=

# PayPal
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_MODE=production

# Fawry (Egypt)
FAWRY_MERCHANT_CODE=
FAWRY_SECURITY_KEY=
FAWRY_API_URL=

# Paymob (Egypt/MENA)
PAYMOB_API_KEY=
PAYMOB_INTEGRATION_ID=
PAYMOB_IFRAME_ID=
```

**Important Notes:**
- Replace `your-domain.com` with your actual domain
- Generate a strong JWT_SECRET (use: `openssl rand -base64 32`)
- Set your MongoDB password from Step 4.2
- Configure SMTP settings for email functionality
- Save and exit (Ctrl+X, then Y, then Enter)

### 5.5 Create Upload Directory

```bash
mkdir -p /var/www/greendye/GreenDye/backend/uploads
chmod 755 /var/www/greendye/GreenDye/backend/uploads
```

---

## Step 6: Deploy Backend

### 6.1 Test Backend Manually

```bash
cd /var/www/greendye/GreenDye/backend
npm start
```

You should see output indicating the server is running. Press Ctrl+C to stop it.

### 6.2 Start Backend with PM2

```bash
# Start the application with PM2
pm2 start server.js --name greendye-backend

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup

# Copy and run the command that PM2 outputs
```

### 6.3 Verify Backend is Running

```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs greendye-backend

# Test API endpoint
curl http://localhost:5000/api/health
```

---

## Step 7: Deploy Frontend

### 7.1 Install Frontend Dependencies

```bash
cd /var/www/greendye/GreenDye/frontend
npm install
```

### 7.2 Configure Frontend Environment

Create `.env` file in frontend directory:
```bash
nano .env
```

Add:
```env
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_SOCKET_URL=https://your-domain.com
```

### 7.3 Build Frontend for Production

```bash
# Build the frontend
npm run build

# This creates a 'build' directory with optimized production files
```

### 7.4 Set Correct Permissions

```bash
sudo chown -R www-data:www-data /var/www/greendye/GreenDye/frontend/build
```

---

## Step 8: Configure Nginx Web Server

### 8.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/greendye
```

Add this configuration (replace `your-domain.com` with your actual domain):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeout for long-running requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Socket.io proxy
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Upload files location
    location /uploads {
        alias /var/www/greendye/GreenDye/backend/uploads;
        expires 1y;
        add_header Cache-Control "public";
    }

    # Static asset caching - MUST be separate from location / for proper routing
    # This location block uses regex matching and has higher precedence
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        root /var/www/greendye/GreenDye/frontend/build;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Serve frontend static files - React SPA with client-side routing
    # This MUST come after specific location blocks for proper fallback
    location / {
        root /var/www/greendye/GreenDye/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

### 8.2 Enable the Site

```bash
# Create symbolic link to enable site
sudo ln -s /etc/nginx/sites-available/greendye /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 8.3 Verify Website

Visit `http://your-domain.com` in your browser. You should see the GreenDye Academy website!

---

## Step 9: Setup SSL Certificate

### 9.1 Install Certbot

```bash
# Install Certbot and Nginx plugin
sudo apt install -y certbot python3-certbot-nginx
```

### 9.2 Obtain SSL Certificate

```bash
# Get SSL certificate (replace with your domain and email)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com --email your-email@example.com --agree-tos --no-eff-email --redirect
```

Follow the prompts. Certbot will:
- Obtain a certificate from Let's Encrypt
- Automatically configure Nginx for HTTPS
- Set up automatic renewal

### 9.3 Test SSL Configuration

Visit `https://your-domain.com` - you should see a secure connection with a padlock icon.

### 9.4 Verify Auto-Renewal

```bash
# Test renewal process (dry run)
sudo certbot renew --dry-run
```

The certificate will auto-renew every 60 days.

---

## Step 10: Configure Firewall

### 10.1 Setup UFW Firewall

```bash
# Install UFW if not already installed
sudo apt install -y ufw

# Allow SSH (IMPORTANT: Don't skip this!)
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check firewall status
sudo ufw status
```

**Warning**: Make sure to allow SSH (port 22) before enabling the firewall, or you'll be locked out!

---

## Step 11: Setup Automatic Backups

### 11.1 Create Backup Script

```bash
# Create backup directory
sudo mkdir -p /backups/greendye

# Create backup script
sudo nano /usr/local/bin/greendye-backup.sh
```

Add this script:
```bash
#!/bin/bash

# GreenDye Academy Backup Script
BACKUP_DIR="/backups/greendye"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/greendye/GreenDye"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup MongoDB
echo "Backing up MongoDB..."
mongodump --uri="mongodb://greendye_user:YOUR_APP_PASSWORD_HERE@localhost:27017/greendye" --out=$BACKUP_DIR/mongodb_$DATE

# Backup uploaded files
echo "Backing up uploaded files..."
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C $APP_DIR/backend uploads/

# Backup configuration files
echo "Backing up configuration..."
cp $APP_DIR/backend/.env $BACKUP_DIR/env_$DATE.backup

# Remove backups older than 7 days
echo "Cleaning old backups..."
find $BACKUP_DIR -type f -mtime +7 -delete
find $BACKUP_DIR -type d -empty -delete

echo "Backup completed: $DATE"
```

Make it executable:
```bash
sudo chmod +x /usr/local/bin/greendye-backup.sh
```

### 11.2 Schedule Automatic Backups

```bash
# Edit crontab
sudo crontab -e
```

Add this line to run backups daily at 2 AM:
```
0 2 * * * /usr/local/bin/greendye-backup.sh >> /var/log/greendye-backup.log 2>&1
```

### 11.3 Test Backup Script

```bash
sudo /usr/local/bin/greendye-backup.sh
ls -lh /backups/greendye/
```

---

## Step 12: Configure Monitoring

### 12.1 Monitor Application with PM2

```bash
# View PM2 dashboard
pm2 monit

# Check logs
pm2 logs greendye-backend

# View detailed info
pm2 show greendye-backend
```

### 12.2 Setup PM2 Log Rotation

```bash
# Install PM2 log rotate module
pm2 install pm2-logrotate

# Configure log rotation (keep 7 days of logs)
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### 12.3 Monitor System Resources

```bash
# Install htop for system monitoring
sudo apt install -y htop

# View system resources
htop
```

### 12.4 Check Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

---

## Troubleshooting

### Backend Not Starting

**Check PM2 logs:**
```bash
pm2 logs greendye-backend --lines 50
```

**Common issues:**
- MongoDB connection failed: Check MONGODB_URI in .env
- Port already in use: Check if another service is using port 5000
- Permission errors: Check file permissions

**Solution:**
```bash
# Restart the application
pm2 restart greendye-backend

# Check MongoDB is running
sudo systemctl status mongod
```

### Frontend Not Loading

**Check Nginx configuration:**
```bash
sudo nginx -t
```

**Check Nginx logs:**
```bash
sudo tail -f /var/log/nginx/error.log
```

**Common issues:**
- 502 Bad Gateway: Backend not running or wrong proxy_pass URL
- 404 Not Found: Wrong root path in Nginx config
- Permission denied: Wrong file permissions

**Solution:**
```bash
# Ensure correct permissions
sudo chown -R www-data:www-data /var/www/greendye/GreenDye/frontend/build

# Reload Nginx
sudo systemctl reload nginx
```

### Database Connection Issues

**Test MongoDB connection:**
```bash
mongosh "mongodb://greendye_user:YOUR_PASSWORD@localhost:27017/greendye"
```

**Check MongoDB status:**
```bash
sudo systemctl status mongod
sudo tail -f /var/log/mongodb/mongod.log
```

**Solution:**
```bash
# Restart MongoDB
sudo systemctl restart mongod

# Check firewall
sudo ufw status
```

### SSL Certificate Issues

**Check certificate status:**
```bash
sudo certbot certificates
```

**Renew certificate manually:**
```bash
sudo certbot renew
```

**Solution:**
```bash
# If renewal fails, try forcing renewal
sudo certbot renew --force-renewal
```

### High Memory Usage

**Check memory usage:**
```bash
free -h
htop
```

**Solution:**
```bash
# Restart PM2 apps
pm2 restart all

# Clear system cache
sudo sync && echo 3 | sudo tee /proc/sys/vm/drop_caches
```

### Application Running Slowly

**Check system resources:**
```bash
htop
df -h  # Check disk space
```

**Check database performance:**
```bash
mongosh greendye --eval "db.stats()"
```

**Solution:**
1. Optimize database queries
2. Add database indexes
3. Increase VPS resources if needed
4. Setup Redis for caching

---

## Maintenance and Updates

### Update Application

```bash
# Navigate to application directory
cd /var/www/greendye/GreenDye

# Backup before updating
sudo /usr/local/bin/greendye-backup.sh

# Pull latest changes
git pull origin main

# Update backend
cd backend
npm install
pm2 restart greendye-backend

# Update frontend
cd ../frontend
npm install
npm run build

# Reload Nginx
sudo systemctl reload nginx
```

### Update System Packages

```bash
# Update package list
sudo apt update

# Upgrade packages
sudo apt upgrade -y

# Reboot if kernel updated
sudo reboot
```

### Update Node.js

```bash
# Update to latest LTS version
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Restart application
pm2 restart greendye-backend
```

### Database Maintenance

```bash
# Connect to MongoDB
mongosh greendye

# Check database stats
db.stats()

# Compact database
db.runCommand({ compact: 'collection_name' })

# Check indexes
db.getCollectionNames().forEach(function(col) {
    print("Indexes for " + col + ":");
    printjson(db[col].getIndexes());
});
```

---

## Security Best Practices

### 1. Regular Updates

```bash
# Setup automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 2. SSH Security

```bash
# Disable root login via SSH
sudo nano /etc/ssh/sshd_config
```

Set:
```
PermitRootLogin no
PasswordAuthentication no  # Use SSH keys only
```

Restart SSH:
```bash
sudo systemctl restart sshd
```

### 3. Fail2Ban (Protect Against Brute Force)

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Start and enable
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Check status
sudo fail2ban-client status
```

### 4. Monitor Application Logs

```bash
# Setup log monitoring
pm2 logs greendye-backend --lines 100

# Check for suspicious activity in Nginx logs
sudo tail -f /var/log/nginx/access.log | grep -i "POST\|DELETE\|PUT"
```

### 5. Regular Backups

- Keep backups offsite (e.g., AWS S3, Backblaze)
- Test backup restoration regularly
- Encrypt sensitive backups

### 6. Environment Variables Security

```bash
# Ensure .env file has restricted permissions
chmod 600 /var/www/greendye/GreenDye/backend/.env

# Never commit .env to git
echo ".env" >> .gitignore
```

### 7. Database Security

- Use strong passwords
- Enable MongoDB authentication
- Restrict MongoDB to localhost
- Regular security audits

### 8. Application Security

- Keep all dependencies updated: `npm audit fix`
- Use HTTPS only (enforce in Nginx)
- Enable rate limiting in application
- Validate all user input
- Use prepared statements for database queries

---

## Performance Optimization

### 1. Enable Gzip Compression in Nginx

```bash
sudo nano /etc/nginx/nginx.conf
```

Add in `http` block:
```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
```

### 2. Setup Redis for Caching (Optional)

```bash
# Install Redis
sudo apt install -y redis-server

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Update backend .env
echo "REDIS_HOST=localhost" >> /var/www/greendye/GreenDye/backend/.env
echo "REDIS_PORT=6379" >> /var/www/greendye/GreenDye/backend/.env
```

### 3. Enable Browser Caching

Already configured in the Nginx setup above. Static assets are cached for 1 year.

### 4. CDN Integration (Optional)

For better performance, consider using a CDN like:
- Cloudflare (free tier available)
- AWS CloudFront
- BunnyCDN

---

## Next Steps

After successful installation:

1. **Create Admin Account**
   - Access your site
   - Register the first user (will be admin)
   - Configure platform settings

2. **Configure Payment Gateways**
   - Add your payment gateway credentials in .env
   - Test payment flows
   - See [Payment Integration Guide](PAYMENT_INTEGRATION.md)

3. **Customize Branding**
   - Update logo and colors
   - Configure email templates
   - Set up email SMTP properly

4. **Create Initial Content**
   - Add courses
   - Upload course materials
   - Create user accounts for trainers

5. **Setup Monitoring**
   - Configure uptime monitoring (e.g., UptimeRobot)
   - Setup error tracking (e.g., Sentry)
   - Configure analytics (e.g., Google Analytics)

6. **Test Everything**
   - User registration
   - Course enrollment
   - Payment processing
   - Certificate generation
   - Email notifications

---

## Additional Resources

- [API Documentation](API_REFERENCE.md)
- [Payment Integration Guide](PAYMENT_INTEGRATION.md)
- [User Guide](USER_GUIDE.md)
- [Features Documentation](FEATURES.md)
- [Mobile App Setup](MOBILE_APP_SETUP.md)

---

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review application logs: `pm2 logs greendye-backend`
3. Check system logs: `/var/log/nginx/error.log`
4. Visit [GitHub Issues](https://github.com/mohamedaseleim/GreenDye/issues)
5. Contact support: support@greendye-academy.com

---

## Conclusion

Congratulations! 🎉 You've successfully installed GreenDye Academy on your VPS. Your e-learning platform is now ready to serve students across Africa, Asia, and the Middle East.

Remember to:
- Keep your system and application updated
- Monitor your application regularly
- Maintain regular backups
- Follow security best practices

Happy teaching and learning! 🌿📚
