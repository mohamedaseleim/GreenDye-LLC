# Complete Guide to Install GreenDye Academy on Heliohost VPS

This comprehensive, step-by-step guide will help you install and configure GreenDye Academy on a Heliohost VPS with Hestia Control Panel. This guide is specifically tailored for Heliohost's infrastructure and covers everything from initial setup to production deployment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Step 1: Get Your Heliohost VPS](#step-1-get-your-heliohost-vps)
- [Step 2: Initial Server Access and Configuration](#step-2-initial-server-access-and-configuration)
- [Step 3: Install Required Dependencies](#step-3-install-required-dependencies)
- [Step 4: Install and Configure MongoDB](#step-4-install-and-configure-mongodb)
- [Step 5: Configure Hestia Control Panel](#step-5-configure-hestia-control-panel)
- [Step 6: Setup Hestia Templates for Node.js](#step-6-setup-hestia-templates-for-nodejs)
- [Step 7: Clone and Configure GreenDye](#step-7-clone-and-configure-greendye)
- [Step 8: Deploy the Backend](#step-8-deploy-the-backend)
- [Step 9: Deploy the Frontend](#step-9-deploy-the-frontend)
- [Step 10: Configure Nginx with Hestia](#step-10-configure-nginx-with-hestia)
- [Step 11: Enable SSL Certificates](#step-11-enable-ssl-certificates)
- [Step 12: Configure Firewall](#step-12-configure-firewall)
- [Step 13: Setup Automatic Backups](#step-13-setup-automatic-backups)
- [Step 14: Maintenance and Monitoring](#step-14-maintenance-and-monitoring)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

---

## Prerequisites

### 1. Heliohost VPS Account
- **VPS Plan**: Heliohost VPS with minimum 2GB RAM (4GB recommended)
- **Operating System**: Ubuntu 22.04 LTS (should come pre-installed)
- **Control Panel**: Hestia Control Panel v1.9.4 or newer (included with Heliohost VPS)
- **Root Access**: SSH access as root or sudo user
- **Software**: Will install Node.js 20.x LTS and MongoDB 6.0

### 2. Domain Name
- A registered domain name (e.g., youracademy.com)
- Access to your domain's DNS management
- Domain nameservers pointed to Heliohost's nameservers:
  - `ns1.heliohost.org`
  - `ns2.heliohost.org`

### 3. Required Knowledge
- Basic Linux command line skills
- Understanding of SSH connections
- Basic understanding of web servers and domains

### 4. Local Machine Requirements
- SSH client (Terminal on Mac/Linux, PuTTY on Windows)
- Text editor for copying/pasting commands
- Web browser for accessing Hestia Control Panel

---

## Step 1: Get Your Heliohost VPS

### 1.1 Order Your VPS

1. Visit [Heliohost VPS Plans](https://heliohost.org)
2. Choose a VPS plan (minimum recommended: VPS-2 with 2GB RAM)
3. Complete the order process
4. Wait for VPS provisioning email (usually within a few hours)

### 1.2 Receive Your VPS Credentials

You'll receive an email with:
- **VPS IP Address**: e.g., `123.45.67.89`
- **Root Password**: Your initial root password
- **Hestia Control Panel URL**: `https://your-vps-ip:8083`
- **Hestia Admin Username**: Usually `admin`
- **Hestia Admin Password**: Your control panel password

### 1.3 First Login Test

**Test Hestia Control Panel:**
1. Open browser to `https://YOUR_VPS_IP:8083`
2. Accept the security warning (we'll fix this with SSL later)
3. Login with admin credentials
4. You should see the Hestia dashboard

**Test SSH Access:**
```bash
# On Mac/Linux Terminal or Windows PowerShell
ssh root@YOUR_VPS_IP
```

Enter your root password when prompted.

---

## Step 2: Initial Server Access and Configuration

### 2.1 Connect via SSH

```bash
# Replace with your actual VPS IP
ssh root@YOUR_VPS_IP
```

If you get a host key verification prompt, type `yes`.

### 2.2 Update System Packages

First, let's ensure your system is up to date:

```bash
# Update package lists
apt update

# Upgrade installed packages
apt upgrade -y

# Install essential tools
apt install -y curl wget git build-essential software-properties-common vim
```

This may take 5-10 minutes depending on updates needed.

### 2.3 Set the Timezone

Set your server timezone to match your location:

```bash
# List available timezones
timedatectl list-timezones | grep -i "Africa\|Asia\|Europe"

# Set timezone (example: Cairo, Egypt)
timedatectl set-timezone Africa/Cairo

# Verify
timedatectl
```

Common timezones:
- `Africa/Cairo` - Egypt
- `Asia/Dubai` - UAE
- `Asia/Riyadh` - Saudi Arabia
- `Africa/Lagos` - Nigeria
- `UTC` - Universal Time

### 2.4 Configure Hostname

```bash
# Set a memorable hostname
hostnamectl set-hostname greendye-academy

# Update hosts file
nano /etc/hosts
```

Add this line at the top:
```
127.0.0.1 greendye-academy
```

Press `Ctrl+X`, then `Y`, then `Enter` to save and exit.

### 2.5 Create Application User (Optional but Recommended)

While Hestia creates users automatically, we'll use the admin user for consistency:

```bash
# Check Hestia admin user
ls -la /home/
```

You should see an `admin` directory. We'll use this for deployment.

---

## Step 3: Install Required Dependencies

### 3.1 Install Node.js 20 LTS

Node.js is required for running the GreenDye backend:

```bash
# Add NodeSource repository for Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Install Node.js and npm
apt-get install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show v10.x.x or higher
```

**Expected output:**
```
v20.18.0
10.8.2
```

**Note:** Node.js 18.x is also compatible if you prefer it. The project requires Node.js >= 16.x.

### 3.2 Install PM2 Process Manager

PM2 will keep your Node.js application running and restart it automatically if it crashes:

```bash
# Install PM2 globally
npm install -g pm2

# Verify PM2 installation
pm2 --version

# Create PM2 startup script
pm2 startup systemd
```

Copy and execute the command that PM2 outputs.

### 3.3 Verify Nginx Installation

Hestia comes with Nginx pre-installed, but let's verify:

```bash
# Check Nginx version
nginx -v

# Check Nginx status
systemctl status nginx

# If Nginx isn't running, start it
systemctl start nginx
systemctl enable nginx
```

---

## Step 4: Install and Configure MongoDB

### 4.1 Install MongoDB 6.0

```bash
# Import MongoDB GPG key (using modern method)
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg

# Add MongoDB repository for Ubuntu 22.04
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package list
apt-get update

# Install MongoDB
apt-get install -y mongodb-org

# Start MongoDB service
systemctl start mongod

# Enable MongoDB to start on boot
systemctl enable mongod

# Verify MongoDB is running
systemctl status mongod
```

**Expected output:** You should see `active (running)` in green.

### 4.2 Secure MongoDB Database

**Important:** Always secure your MongoDB installation!

```bash
# Connect to MongoDB shell
mongosh
```

In the MongoDB shell, create an admin user:

```javascript
// Switch to admin database
use admin

// Create admin user (CHANGE THE PASSWORD!)
db.createUser({
  user: "admin",
  pwd: "YourStrongAdminPassword123!",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
})

// Create GreenDye database
use greendye

// Create application user (CHANGE THE PASSWORD!)
db.createUser({
  user: "greendye_user",
  pwd: "YourStrongAppPassword123!",
  roles: [ { role: "readWrite", db: "greendye" } ]
})

// Exit MongoDB shell
exit
```

**Important:** Save these passwords securely! You'll need them later.

### 4.3 Enable MongoDB Authentication

```bash
# Edit MongoDB configuration
nano /etc/mongod.conf
```

Find the `#security:` section (around line 28) and modify it to:

```yaml
security:
  authorization: enabled
```

Save and exit (`Ctrl+X`, `Y`, `Enter`).

```bash
# Restart MongoDB to apply changes
systemctl restart mongod

# Test authentication
mongosh -u greendye_user -p YourStrongAppPassword123! --authenticationDatabase greendye greendye
```

If you can connect, MongoDB is properly secured!

---

## Step 5: Configure Hestia Control Panel

### 5.1 Access Hestia Control Panel

Open your browser to: `https://YOUR_VPS_IP:8083`

Login with:
- Username: `admin`
- Password: Your Hestia admin password

### 5.2 Add Your Domain in Hestia

1. Click on **"WEB"** in the top menu
2. Click the **green "+" button** (Add Web Domain)
3. Fill in the form:
   - **Domain**: `yourdomain.com`
   - **Aliases**: `www.yourdomain.com`
   - **IP Address**: Select your VPS IP
   - **Web Template**: We'll configure this later
4. Click **"Save"**

### 5.3 Configure DNS in Hestia

1. Click on **"DNS"** in the top menu
2. Find your domain and click on it
3. Verify these records exist:
   - `A` record for `@` pointing to your VPS IP
   - `A` record for `www` pointing to your VPS IP
4. Wait 10-30 minutes for DNS propagation

**Test DNS propagation:**
```bash
# On your local machine
dig yourdomain.com +short
# Should return your VPS IP address
```

---

## Step 6: Setup Hestia Templates for Node.js

Hestia doesn't have built-in Node.js templates, so we'll create custom ones.

### 6.1 Create Node.js Nginx Template

```bash
# Navigate to Hestia Nginx templates directory
cd /usr/local/hestia/data/templates/web/nginx

# Create custom Node.js template
nano nodejs.tpl
```

Add this configuration:

```nginx
server {
    listen      %ip%:%web_port%;
    server_name %domain_idn% %alias_idn%;
    root        %docroot%;
    index       index.html index.htm;
    access_log  /var/log/nginx/domains/%domain%.log combined;
    access_log  /var/log/nginx/domains/%domain%.bytes bytes;
    error_log   /var/log/nginx/domains/%domain%.error.log error;

    include %home%/%user%/conf/web/%domain%/nginx.forcessl.conf*;

    location = /favicon.ico {
        log_not_found off;
        access_log off;
    }

    location = /robots.txt {
        allow all;
        log_not_found off;
        access_log off;
    }

    # Backend API proxy to Node.js
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Socket.io proxy for real-time features
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Serve uploaded files
    location /uploads {
        alias %home%/%user%/web/%domain%/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Static asset caching - MUST be separate from location / for proper routing
    # This location block uses regex matching and has higher precedence
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Frontend React application - catch all for client-side routing
    # This MUST come after specific location blocks for proper fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    location ~ /\.ht    {return 404;}
    location ~ /\.svn/  {return 404;}
    location ~ /\.git/  {return 404;}
    location ~ /\.hg/   {return 404;}
    location ~ /\.bzr/  {return 404;}

    include %home%/%user%/conf/web/%domain%/nginx.conf_*;
}
```

Save and exit.

### 6.2 Create SSL Version of Template

```bash
# Create SSL template
nano nodejs.stpl
```

Add this configuration (SSL version):

```nginx
server {
    listen      %ip%:%web_ssl_port% ssl http2;
    server_name %domain_idn% %alias_idn%;
    root        %sdocroot%;
    index       index.html index.htm;
    access_log  /var/log/nginx/domains/%domain%.log combined;
    access_log  /var/log/nginx/domains/%domain%.bytes bytes;
    error_log   /var/log/nginx/domains/%domain%.error.log error;

    ssl_certificate      %ssl_pem%;
    ssl_certificate_key  %ssl_key%;
    ssl_stapling on;
    ssl_stapling_verify on;

    # TLS 1.3 0-RTT anti-replay
    if ($anti_replay = 307) { return 307 https://$host$request_uri; }
    if ($anti_replay = 425) { return 425; }

    include %home%/%user%/conf/web/%domain%/nginx.hsts.conf*;

    location = /favicon.ico {
        log_not_found off;
        access_log off;
    }

    location = /robots.txt {
        allow all;
        log_not_found off;
        access_log off;
    }

    # Backend API proxy to Node.js
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Socket.io proxy for real-time features
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Serve uploaded files
    location /uploads {
        alias %home%/%user%/web/%domain%/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Static asset caching - MUST be separate from location / for proper routing
    # This location block uses regex matching and has higher precedence
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Frontend React application - catch all for client-side routing
    # This MUST come after specific location blocks for proper fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location ~ /\.ht    {return 404;}
    location ~ /\.svn/  {return 404;}
    location ~ /\.git/  {return 404;}
    location ~ /\.hg/   {return 404;}
    location ~ /\.bzr/  {return 404;}

    include %home%/%user%/conf/web/%domain%/nginx.ssl.conf_*;
}
```

Save and exit.

### 6.3 Apply the Node.js Template to Your Domain

```bash
# Use Hestia CLI to change web template
v-change-web-domain-proxy-tpl admin yourdomain.com nodejs

# Test Nginx configuration
nginx -t

# If test passes, reload Nginx
systemctl reload nginx
```

**Or via Hestia Web UI:**
1. Go to **WEB** → Select your domain → **Edit**
2. Find **"Proxy Template"** dropdown
3. Select **"nodejs"**
4. Click **Save**

---

## Step 7: Clone and Configure GreenDye

### 7.1 Navigate to Web Directory

```bash
# Go to the domain's public directory
cd /home/admin/web/yourdomain.com/public_html

# Create app directory
mkdir -p app
cd app
```

### 7.2 Clone the GreenDye Repository

```bash
# Clone from GitHub
git clone https://github.com/mohamedaseleim/GreenDye.git .

# Check the files
ls -la
```

You should see `backend/`, `frontend/`, `docs/`, etc.

### 7.3 Set Correct Permissions

```bash
# Change ownership to admin user
chown -R admin:admin /home/admin/web/yourdomain.com/public_html/app

# Set proper permissions
find /home/admin/web/yourdomain.com/public_html/app -type d -exec chmod 755 {} \;
find /home/admin/web/yourdomain.com/public_html/app -type f -exec chmod 644 {} \;
```

---

## Step 8: Deploy the Backend

### 8.1 Install Backend Dependencies

```bash
cd /home/admin/web/yourdomain.com/public_html/app/backend

# Install production dependencies
npm install --production
```

This will take 2-5 minutes.

### 8.2 Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit environment file
nano .env
```

**Configure these critical variables:**

```env
# === Server Configuration ===
NODE_ENV=production
PORT=5000
API_URL=https://yourdomain.com

# === Database Configuration ===
# Use the MongoDB user and password you created earlier
MONGODB_URI=mongodb://greendye_user:YourStrongAppPassword123!@localhost:27017/greendye

# === JWT Configuration ===
# Generate with: openssl rand -base64 32
JWT_SECRET=your-super-secret-random-string-minimum-32-chars
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# === Email Configuration (SMTP) ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=GreenDye Academy

# === File Upload Configuration ===
MAX_FILE_SIZE=10485760
FILE_UPLOAD_PATH=/home/admin/web/yourdomain.com/uploads

# === Frontend URL ===
FRONTEND_URL=https://yourdomain.com

# === Security ===
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# === Payment Gateways (Optional) ===
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

# Paymob (MENA)
PAYMOB_API_KEY=
PAYMOB_INTEGRATION_ID=
```

**Important Notes:**
- Replace `yourdomain.com` with your actual domain
- Generate a strong JWT_SECRET: `openssl rand -base64 32`
- For Gmail SMTP, use an [App Password](https://support.google.com/accounts/answer/185833)
- Save the file: `Ctrl+X`, `Y`, `Enter`

### 8.3 Create Upload Directory

```bash
# Create uploads directory
mkdir -p /home/admin/web/yourdomain.com/uploads

# Set permissions
chown -R admin:admin /home/admin/web/yourdomain.com/uploads
chmod 755 /home/admin/web/yourdomain.com/uploads
```

### 8.4 Test Backend Manually

```bash
# Test if the backend starts without errors
cd /home/admin/web/yourdomain.com/public_html/app/backend
node server.js
```

You should see output like:
```
Server running in production mode on port 5000
MongoDB connected successfully
```

Press `Ctrl+C` to stop the test.

### 8.5 Start Backend with PM2

```bash
# Start the application with PM2
pm2 start server.js --name greendye-backend

# Save PM2 process list to restart on reboot
pm2 save

# View status
pm2 status

# View logs
pm2 logs greendye-backend --lines 20
```

### 8.6 Verify Backend API

```bash
# Test API health endpoint
curl http://localhost:5000/api/health

# Should return something like:
# {"status":"ok","message":"API is running"}
```

---

## Step 9: Deploy the Frontend

### 9.1 Install Frontend Dependencies

```bash
cd /home/admin/web/yourdomain.com/public_html/app/frontend

# Install dependencies
npm install
```

This will take 3-7 minutes.

### 9.2 Configure Frontend Environment

```bash
# Create frontend environment file
nano .env
```

Add:
```env
REACT_APP_API_URL=https://yourdomain.com/api
REACT_APP_SOCKET_URL=https://yourdomain.com
```

Save and exit.

### 9.3 Build Frontend for Production

```bash
# Build the optimized production bundle
npm run build
```

This creates an optimized `build/` directory. Wait 2-5 minutes for the build to complete.

### 9.4 Deploy Frontend Build

```bash
# Remove old public_html contents
cd /home/admin/web/yourdomain.com/public_html
rm -rf * .[^.]*

# Copy frontend build to public_html
cp -r /home/admin/web/yourdomain.com/public_html/app/frontend/build/* /home/admin/web/yourdomain.com/public_html/

# Set correct permissions
chown -R admin:admin /home/admin/web/yourdomain.com/public_html
find /home/admin/web/yourdomain.com/public_html -type d -exec chmod 755 {} \;
find /home/admin/web/yourdomain.com/public_html -type f -exec chmod 644 {} \;
```

---

## Step 10: Configure Nginx with Hestia

### 10.1 Verify Nginx Configuration

The Node.js template we created earlier should already be applied. Let's verify:

```bash
# Test Nginx configuration
nginx -t

# Should output:
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 10.2 Check Domain Configuration

```bash
# View your domain's Nginx config
cat /home/admin/conf/web/yourdomain.com/nginx.conf
```

You should see the proxy configuration for `/api` and `/socket.io`.

### 10.3 Reload Nginx

```bash
# Reload Nginx to apply any changes
systemctl reload nginx
```

### 10.4 Test Your Website

Open a browser and visit: `http://yourdomain.com`

You should see the GreenDye Academy website!

**If you see a 502 Bad Gateway:**
- Check backend is running: `pm2 status`
- Check logs: `pm2 logs greendye-backend`
- Verify MongoDB is running: `systemctl status mongod`

---

## Step 11: Enable SSL Certificates

### 11.1 Install SSL via Hestia Control Panel

**Method 1: Using Hestia Web UI (Easiest)**

1. Login to Hestia: `https://YOUR_VPS_IP:8083`
2. Go to **WEB** → Click on your domain
3. Click **Edit** button (pencil icon)
4. Scroll down to **SSL Support**
5. Select **"Enable Let's Encrypt support"**
6. Check **"Enable automatic HTTPS redirection"**
7. Click **Save**

Hestia will automatically:
- Obtain SSL certificate from Let's Encrypt
- Configure Nginx for HTTPS
- Setup auto-renewal

**Method 2: Using Hestia CLI**

```bash
# Request SSL certificate
v-add-letsencrypt-domain admin yourdomain.com www.yourdomain.com

# Enable SSL
v-add-web-domain-ssl admin yourdomain.com ~/conf/web/yourdomain.com/ssl

# Force HTTPS redirect
v-add-web-domain-ssl-force admin yourdomain.com
```

### 11.2 Verify SSL Certificate

```bash
# Check SSL certificate details
v-list-web-domain-ssl admin yourdomain.com
```

Visit your site: `https://yourdomain.com`

You should see:
- A padlock icon in the browser
- Secure HTTPS connection
- Valid SSL certificate

### 11.3 Test SSL Configuration

Use SSL Labs to test your SSL setup:
1. Visit: https://www.ssllabs.com/ssltest/
2. Enter your domain: `yourdomain.com`
3. Click "Submit"
4. Wait for the analysis (takes 2-3 minutes)
5. Aim for an "A" grade or better

### 11.4 SSL Auto-Renewal

Hestia automatically renews Let's Encrypt certificates. Verify the cron job:

```bash
# Check Hestia cron jobs
crontab -l | grep letsencrypt
```

You should see a cron job that runs daily.

---

## Step 12: Configure Firewall

### 12.1 Setup UFW Firewall

Heliohost VPS may have UFW already configured, but let's ensure it's set up correctly:

```bash
# Check UFW status
ufw status

# If UFW is inactive, configure it:
# IMPORTANT: Allow SSH first to avoid locking yourself out!
ufw allow 22/tcp comment 'SSH'

# Allow HTTP and HTTPS
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Allow Hestia Control Panel
ufw allow 8083/tcp comment 'Hestia CP'

# Allow email ports (if using email)
ufw allow 25/tcp comment 'SMTP'
ufw allow 587/tcp comment 'SMTP Submission'
ufw allow 465/tcp comment 'SMTPS'
ufw allow 993/tcp comment 'IMAPS'
ufw allow 995/tcp comment 'POP3S'

# Enable firewall
ufw enable

# Check status
ufw status numbered
```

### 12.2 Configure Fail2Ban (Protection Against Brute Force)

```bash
# Install Fail2Ban
apt install -y fail2ban

# Start and enable Fail2Ban
systemctl start fail2ban
systemctl enable fail2ban

# Check status
fail2ban-client status

# Check SSH jail status
fail2ban-client status sshd
```

### 12.3 Verify Firewall Rules

```bash
# List all rules
ufw status verbose

# Expected output should show:
# 22/tcp (SSH) - ALLOWED
# 80/tcp (HTTP) - ALLOWED
# 443/tcp (HTTPS) - ALLOWED
# 8083/tcp (Hestia) - ALLOWED
```

---

## Step 13: Setup Automatic Backups

### 13.1 Configure Hestia Automatic Backups

Hestia has built-in backup functionality:

1. Login to Hestia Control Panel
2. Click **"Server"** in top menu
3. Click **"Configure Server"**
4. Find **"Backup"** section
5. Configure:
   - **Backup System**: Enabled
   - **Backup Directory**: `/backup`
   - **Backup Retention**: 7 days
   - **Backup Schedule**: Daily at 2 AM
6. Click **Save**

### 13.2 Create Custom MongoDB Backup Script

For extra safety, create a dedicated MongoDB backup:

```bash
# Create backup directory
mkdir -p /backups/greendye

# Create backup script
nano /usr/local/bin/greendye-backup.sh
```

Add this script:

```bash
#!/bin/bash

# GreenDye Academy Backup Script
BACKUP_DIR="/backups/greendye"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/home/admin/web/yourdomain.com/public_html/app"
UPLOADS_DIR="/home/admin/web/yourdomain.com/uploads"

# MongoDB credentials (use your actual credentials)
MONGO_USER="greendye_user"
MONGO_PASS="YourStrongAppPassword123!"
MONGO_DB="greendye"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
echo "$(date): Starting MongoDB backup..."
mongodump \
  --uri="mongodb://${MONGO_USER}:${MONGO_PASS}@localhost:27017/${MONGO_DB}" \
  --out=$BACKUP_DIR/mongodb_$DATE

# Backup uploaded files
echo "$(date): Backing up uploaded files..."
if [ -d "$UPLOADS_DIR" ]; then
  tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C $(dirname $UPLOADS_DIR) $(basename $UPLOADS_DIR)/
fi

# Backup environment configuration
echo "$(date): Backing up configuration..."
cp $APP_DIR/backend/.env $BACKUP_DIR/env_$DATE.backup

# Create a combined archive
echo "$(date): Creating combined archive..."
tar -czf $BACKUP_DIR/greendye_full_backup_$DATE.tar.gz \
  $BACKUP_DIR/mongodb_$DATE \
  $BACKUP_DIR/uploads_$DATE.tar.gz \
  $BACKUP_DIR/env_$DATE.backup

# Remove individual backup components to save space
rm -rf $BACKUP_DIR/mongodb_$DATE
rm -f $BACKUP_DIR/uploads_$DATE.tar.gz
rm -f $BACKUP_DIR/env_$DATE.backup

# Remove backups older than 7 days
echo "$(date): Cleaning old backups..."
find $BACKUP_DIR -name "greendye_full_backup_*.tar.gz" -type f -mtime +7 -delete

# Calculate backup size
BACKUP_SIZE=$(du -sh $BACKUP_DIR | cut -f1)
echo "$(date): Backup completed! Total backup size: $BACKUP_SIZE"
```

Make it executable:

```bash
chmod +x /usr/local/bin/greendye-backup.sh
```

### 13.3 Schedule Automatic Backups

```bash
# Edit root crontab
crontab -e
```

Add this line (runs daily at 2 AM):
```
0 2 * * * /usr/local/bin/greendye-backup.sh >> /var/log/greendye-backup.log 2>&1
```

Save and exit.

### 13.4 Test Backup Script

```bash
# Run backup manually
/usr/local/bin/greendye-backup.sh

# Check backup was created
ls -lh /backups/greendye/

# View backup log
tail -20 /var/log/greendye-backup.log
```

### 13.5 Setup Offsite Backup (Recommended)

For production, store backups offsite:

**Option 1: Rsync to Another Server**
```bash
# Install rsync
apt install -y rsync

# Add to backup script before cleanup:
rsync -avz /backups/greendye/ user@backup-server:/backups/greendye/
```

**Option 2: Upload to Cloud Storage**

Use `rclone` for Google Drive, Dropbox, AWS S3, etc.:
```bash
# Install rclone
curl https://rclone.org/install.sh | bash

# Configure rclone (interactive)
rclone config

# Add to backup script:
rclone copy /backups/greendye/ remote:greendye-backups/
```

---

## Step 14: Maintenance and Monitoring

### 14.1 Monitor Application with PM2

```bash
# View PM2 dashboard (real-time monitoring)
pm2 monit

# Check application status
pm2 status

# View logs (last 100 lines)
pm2 logs greendye-backend --lines 100

# View error logs only
pm2 logs greendye-backend --err --lines 50

# View detailed process info
pm2 show greendye-backend
```

### 14.2 Setup PM2 Log Rotation

Prevent logs from filling up your disk:

```bash
# Install PM2 logrotate module
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M      # Rotate when log reaches 10MB
pm2 set pm2-logrotate:retain 7          # Keep last 7 rotated logs
pm2 set pm2-logrotate:compress true     # Compress old logs
pm2 set pm2-logrotate:workerInterval 60 # Check every 60 seconds

# Verify settings
pm2 conf pm2-logrotate
```

### 14.3 Monitor System Resources

```bash
# Install monitoring tools
apt install -y htop iotop nethogs

# View system resources
htop

# Check disk space
df -h

# Check memory usage
free -h

# Check MongoDB status
systemctl status mongod

# Check Nginx status
systemctl status nginx

# View Nginx logs
tail -f /var/log/nginx/domains/yourdomain.com.error.log
```

### 14.4 Setup Uptime Monitoring (External)

Use free services to monitor your site:

**UptimeRobot (Recommended - Free):**
1. Visit https://uptimerobot.com
2. Create free account
3. Add your domain: `https://yourdomain.com`
4. Set check interval: 5 minutes
5. Add email/SMS alerts

**Alternative Options:**
- Pingdom
- StatusCake
- Freshping

### 14.5 Regular Maintenance Tasks

Create a monthly maintenance checklist:

```bash
# Monthly maintenance script
nano /usr/local/bin/monthly-maintenance.sh
```

Add:
```bash
#!/bin/bash

echo "=== GreenDye Academy Monthly Maintenance ==="
echo "Starting: $(date)"

# Update system packages
echo "Updating system packages..."
apt update && apt upgrade -y

# Update Node.js packages
echo "Checking for npm updates..."
npm -g outdated

# Clean up old logs
echo "Cleaning old logs..."
find /var/log -name "*.gz" -type f -mtime +30 -delete

# Clean up old backups (already handled by backup script)
echo "Checking backups..."
ls -lh /backups/greendye/

# Check disk space
echo "Disk space usage:"
df -h

# Check MongoDB stats
echo "MongoDB statistics:"
mongosh greendye --eval "db.stats()" --quiet

# Restart services for fresh start
echo "Restarting services..."
pm2 restart greendye-backend
systemctl restart mongod

echo "Maintenance completed: $(date)"
```

Make executable:
```bash
chmod +x /usr/local/bin/monthly-maintenance.sh
```

Schedule monthly (1st of each month at 3 AM):
```bash
crontab -e
```
Add:
```
0 3 1 * * /usr/local/bin/monthly-maintenance.sh >> /var/log/monthly-maintenance.log 2>&1
```

---

## Troubleshooting

### Issue 1: Backend Not Starting

**Symptoms:** PM2 shows backend as "errored" or constantly restarting

**Diagnosis:**
```bash
# Check PM2 logs
pm2 logs greendye-backend --lines 50

# Check if port 5000 is already in use
netstat -tlnp | grep 5000

# Test MongoDB connection
mongosh "mongodb://greendye_user:PASSWORD@localhost:27017/greendye"
```

**Solutions:**

**If MongoDB connection fails:**
```bash
# Check MongoDB status
systemctl status mongod

# Check MongoDB logs
tail -50 /var/log/mongodb/mongod.log

# Restart MongoDB
systemctl restart mongod
```

**If port is in use:**
```bash
# Find process using port 5000
lsof -ti:5000

# Kill the process (replace PID)
kill -9 PID

# Restart backend
pm2 restart greendye-backend
```

**If environment variables are wrong:**
```bash
# Verify .env file exists and has correct permissions
ls -la /home/admin/web/yourdomain.com/public_html/app/backend/.env

# Check for syntax errors in .env
cat /home/admin/web/yourdomain.com/public_html/app/backend/.env
```

### Issue 2: Frontend Not Loading

**Symptoms:** Blank page, 404 errors, or Nginx default page

**Diagnosis:**
```bash
# Check if frontend files exist
ls -la /home/admin/web/yourdomain.com/public_html/

# Check Nginx configuration
nginx -t

# Check Nginx error log
tail -50 /var/log/nginx/domains/yourdomain.com.error.log
```

**Solutions:**

**If files are missing:**
```bash
# Rebuild frontend
cd /home/admin/web/yourdomain.com/public_html/app/frontend
npm run build

# Re-copy build files
rm -rf /home/admin/web/yourdomain.com/public_html/*
cp -r build/* /home/admin/web/yourdomain.com/public_html/
chown -R admin:admin /home/admin/web/yourdomain.com/public_html
```

**If Nginx config is wrong:**
```bash
# Reapply Node.js template
v-change-web-domain-proxy-tpl admin yourdomain.com nodejs

# Test and reload
nginx -t && systemctl reload nginx
```

### Issue 3: 502 Bad Gateway Error

**Symptoms:** Browser shows "502 Bad Gateway"

**Diagnosis:**
```bash
# Check if backend is running
pm2 status

# Check backend logs
pm2 logs greendye-backend

# Test backend directly
curl http://localhost:5000/api/health
```

**Solutions:**

**If backend is down:**
```bash
pm2 restart greendye-backend
pm2 logs greendye-backend
```

**If backend is running but not responding:**
```bash
# Check MongoDB
systemctl status mongod

# Restart everything
systemctl restart mongod
pm2 restart greendye-backend
```

### Issue 4: SSL Certificate Issues

**Symptoms:** SSL certificate warnings, "Not Secure" in browser

**Diagnosis:**
```bash
# Check SSL certificate status
v-list-web-domain-ssl admin yourdomain.com

# Check Let's Encrypt logs
tail -50 /var/log/letsencrypt/letsencrypt.log
```

**Solutions:**

**If certificate expired or invalid:**
```bash
# Renew certificate
v-delete-letsencrypt-domain admin yourdomain.com
v-add-letsencrypt-domain admin yourdomain.com www.yourdomain.com

# Force HTTPS
v-add-web-domain-ssl-force admin yourdomain.com
```

**If DNS issues prevent certificate:**
```bash
# Verify DNS is pointing correctly
dig yourdomain.com +short
dig www.yourdomain.com +short

# Both should return your VPS IP
```

### Issue 5: High Memory Usage

**Symptoms:** Server running slow, OOM (Out of Memory) errors

**Diagnosis:**
```bash
# Check memory usage
free -h
htop

# Check which process is using memory
ps aux --sort=-%mem | head -10
```

**Solutions:**

**Restart services:**
```bash
pm2 restart all
systemctl restart mongod
```

**Optimize PM2:**
```bash
# Limit memory usage
pm2 start server.js --name greendye-backend --max-memory-restart 500M
pm2 save
```

**Add swap space (if server has <4GB RAM):**
```bash
# Create 2GB swap file
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### Issue 6: Database Connection Errors

**Symptoms:** "MongoNetworkError" or authentication failures

**Diagnosis:**
```bash
# Test MongoDB connection
mongosh "mongodb://greendye_user:PASSWORD@localhost:27017/greendye"

# Check MongoDB logs
tail -50 /var/log/mongodb/mongod.log

# Verify authentication is enabled
grep "authorization" /etc/mongod.conf
```

**Solutions:**

**Reset MongoDB password:**
```bash
# Stop MongoDB
systemctl stop mongod

# Temporarily disable auth in /etc/mongod.conf
# Comment out: authorization: enabled

# Restart MongoDB
systemctl start mongod

# Connect and reset password
mongosh
use greendye
db.updateUser("greendye_user", {pwd: "NewPassword123!"})
exit

# Re-enable auth in /etc/mongod.conf
# Uncomment: authorization: enabled

# Restart MongoDB
systemctl restart mongod

# Update .env with new password
```

### Issue 7: Email Not Sending

**Symptoms:** Users not receiving registration emails, password resets, etc.

**Diagnosis:**
```bash
# Check backend logs for email errors
pm2 logs greendye-backend | grep -i "email\|smtp"

# Test SMTP connection
telnet smtp.gmail.com 587
```

**Solutions:**

**For Gmail:**
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Update `.env` with the app password (not your regular password)

```bash
# Edit .env
nano /home/admin/web/yourdomain.com/public_html/app/backend/.env

# Update these lines:
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-character-app-password

# Restart backend
pm2 restart greendye-backend
```

**Alternative: Use SendGrid, Mailgun, or AWS SES**

### Issue 8: Firewall Blocking Connections

**Symptoms:** Can't connect to certain services

**Diagnosis:**
```bash
# Check firewall status
ufw status numbered

# Check if specific port is open
nc -zv localhost 5000
```

**Solutions:**

```bash
# Allow specific port
ufw allow 5000/tcp

# Reload firewall
ufw reload
```

---

## Advanced Configuration

### Enable Redis for Caching (Optional)

Redis can significantly improve performance:

```bash
# Install Redis
apt install -y redis-server

# Start and enable Redis
systemctl start redis-server
systemctl enable redis-server

# Test Redis
redis-cli ping
# Should return: PONG

# Add to backend .env
echo "REDIS_HOST=localhost" >> /home/admin/web/yourdomain.com/public_html/app/backend/.env
echo "REDIS_PORT=6379" >> /home/admin/web/yourdomain.com/public_html/app/backend/.env

# Restart backend
pm2 restart greendye-backend
```

### Setup CDN with Cloudflare (Free)

1. Sign up at https://cloudflare.com
2. Add your domain
3. Update nameservers at your domain registrar to Cloudflare's
4. Enable "Always Use HTTPS" in SSL/TLS settings
5. Enable "Auto Minify" for HTML, CSS, JS
6. Enable "Brotli" compression

### Enable Nginx Caching

```bash
# Edit Nginx http block
nano /etc/nginx/nginx.conf
```

Add in `http` block:
```nginx
# Caching
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m use_temp_path=off;
```

Then in your domain config, add to `/api` location:
```nginx
proxy_cache api_cache;
proxy_cache_valid 200 10m;
proxy_cache_valid 404 1m;
add_header X-Cache-Status $upstream_cache_status;
```

### Setup Email Server with Hestia

If you want to send/receive emails from your domain:

1. Login to Hestia Control Panel
2. Go to **MAIL** → Click **+** to add mail domain
3. Add: `yourdomain.com`
4. Create email accounts as needed
5. Update DNS records (MX, SPF, DKIM) as shown in Hestia
6. Use these settings in your application:
   - SMTP: `mail.yourdomain.com`
   - Port: `587` (or `465` for SSL)

### Implement Rate Limiting

The application has built-in rate limiting. To customize:

```bash
# Edit backend .env
nano /home/admin/web/yourdomain.com/public_html/app/backend/.env
```

Update:
```env
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100  # Max 100 requests per window
```

### Setup Application Monitoring with PM2 Plus

```bash
# Link PM2 to PM2 Plus (free tier available)
pm2 link <secret_key> <public_key>

# Visit https://app.pm2.io for real-time monitoring
```

---

## Security Best Practices

### 1. Regular Security Updates

```bash
# Enable automatic security updates
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

### 2. Secure SSH Access

```bash
# Edit SSH config
nano /etc/ssh/sshd_config
```

Set these values:
```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
Port 2222  # Change from default port 22
```

```bash
# Restart SSH
systemctl restart sshd

# Update firewall
ufw delete allow 22/tcp
ufw allow 2222/tcp
```

**Important:** Test new SSH settings before closing your current session!

### 3. MongoDB Security Hardening

```bash
# Edit MongoDB config
nano /etc/mongod.conf
```

Ensure:
```yaml
net:
  bindIp: 127.0.0.1  # Only allow local connections
  port: 27017

security:
  authorization: enabled
```

### 4. Regular Security Audits

```bash
# Check for vulnerable npm packages
cd /home/admin/web/yourdomain.com/public_html/app/backend
npm audit

# Fix vulnerabilities
npm audit fix

# Check for rootkits
apt install -y rkhunter
rkhunter --check
```

### 5. Backup .env File Securely

```bash
# Encrypt .env file in backups
gpg --symmetric --cipher-algo AES256 /backups/greendye/env_*.backup
```

### 6. Monitor Failed Login Attempts

```bash
# View SSH failed attempts
grep "Failed password" /var/log/auth.log | tail -20

# View Fail2Ban status
fail2ban-client status sshd
```

---

## Performance Optimization

### 1. Enable Gzip Compression

```bash
# Edit Nginx config
nano /etc/nginx/nginx.conf
```

Add in `http` block:
```nginx
# Gzip compression
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
gzip_disable "MSIE [1-6]\.";
```

Reload Nginx:
```bash
systemctl reload nginx
```

### 2. Optimize MongoDB

```bash
# Connect to MongoDB
mongosh greendye

# Create indexes for better query performance
db.users.createIndex({ email: 1 }, { unique: true });
db.courses.createIndex({ createdAt: -1 });
db.enrollments.createIndex({ userId: 1, courseId: 1 });

# Check existing indexes
db.users.getIndexes();
```

### 3. Enable HTTP/2

HTTP/2 is already enabled in the SSL template. Verify:

```bash
# Check Nginx config
grep "http2" /home/admin/conf/web/yourdomain.com/nginx.ssl.conf
```

### 4. Optimize PM2

```bash
# Use cluster mode for better CPU utilization
pm2 delete greendye-backend
pm2 start server.js --name greendye-backend -i max
pm2 save
```

---

## Updating GreenDye

When a new version is released:

```bash
# Navigate to app directory
cd /home/admin/web/yourdomain.com/public_html/app

# Backup first!
/usr/local/bin/greendye-backup.sh

# Stash any local changes
git stash

# Pull latest changes
git pull origin main

# Update backend
cd backend
npm install --production
pm2 restart greendye-backend

# Update frontend
cd ../frontend
npm install
npm run build

# Deploy frontend
rm -rf /home/admin/web/yourdomain.com/public_html/*
cp -r build/* /home/admin/web/yourdomain.com/public_html/
chown -R admin:admin /home/admin/web/yourdomain.com/public_html

# Verify everything works
pm2 status
curl https://yourdomain.com
```

---

## Getting Help

### Resources

- **Documentation**: https://github.com/mohamedaseleim/GreenDye/tree/main/docs
- **GitHub Issues**: https://github.com/mohamedaseleim/GreenDye/issues
- **Email Support**: support@greendye-academy.com

### Heliohost Support

- **Heliohost Forum**: https://heliohost.org/forum
- **Heliohost Discord**: Available from their website
- **Support Tickets**: Through Heliohost customer portal

### Before Asking for Help

Gather this information:

```bash
# System info
uname -a
cat /etc/os-release

# Application status
pm2 status
pm2 logs greendye-backend --lines 50

# Services status
systemctl status mongod
systemctl status nginx

# Recent errors
tail -50 /var/log/nginx/domains/yourdomain.com.error.log
```

---

## Conclusion

Congratulations! 🎉 You've successfully installed GreenDye Academy on your Heliohost VPS with Hestia Control Panel!

Your e-learning platform is now:
- ✅ Fully deployed and accessible via HTTPS
- ✅ Secured with SSL certificates
- ✅ Protected by firewall and Fail2Ban
- ✅ Automatically backed up daily
- ✅ Monitored for uptime and performance
- ✅ Optimized for production use

### Next Steps

1. **Create Your Admin Account**
   - Visit: `https://yourdomain.com/register`
   - Register with your email
   - Manually promote to admin in MongoDB:
   ```bash
   mongosh greendye
   db.users.updateOne({email: "your@email.com"}, {$set: {role: "admin"}})
   ```

2. **Configure Your Platform**
   - Add your branding/logo
   - Set up payment gateways (if needed)
   - Configure SMTP for emails
   - Create course categories

3. **Create Content**
   - Add trainer profiles
   - Create your first course
   - Upload course materials
   - Test the complete flow

4. **Go Live!**
   - Announce your platform
   - Start enrolling students
   - Monitor performance

### Remember

- **Backup regularly** - Test restoring backups periodically
- **Update frequently** - Keep system and app updated
- **Monitor continuously** - Check logs and resources
- **Secure always** - Follow security best practices

Happy teaching and learning! 🌿📚🎓

---

**Last Updated**: November 2025  
**Guide Version**: 1.1  
**Compatible with**: GreenDye v1.2.0+, Hestia CP v1.9.4+, Ubuntu 22.04 LTS, Node.js 20.x LTS, MongoDB 6.0+
