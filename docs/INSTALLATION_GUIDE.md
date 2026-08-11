# GreenDye for Training and Consultancy - Installation Guide

Welcome! This guide helps you choose the right installation method for your needs.

## 🎯 Choose Your Installation Path

### 1. 🖥️ Production VPS Installation (Recommended for Live Sites)

**Use this if you want to:**
- Deploy to a production server (DigitalOcean, Linode, Vultr, AWS, etc.)
- Setup a complete production environment from scratch
- Configure SSL certificates, backups, and monitoring
- Have full control over your infrastructure

**👉 [Complete VPS Installation Guide](VPS_INSTALLATION.md)**

**What's Included:**
- ✅ Fresh Ubuntu server setup (22.04)
- ✅ Domain and DNS configuration
- ✅ MongoDB installation and security
- ✅ Node.js and dependencies setup
- ✅ Backend and frontend deployment
- ✅ Nginx web server configuration
- ✅ Free SSL certificate with Let's Encrypt
- ✅ Firewall configuration
- ✅ Automatic backup setup
- ✅ Monitoring and logging
- ✅ Security hardening
- ✅ Troubleshooting guide
- ✅ Maintenance procedures

**Time Required:** 1-2 hours  
**Skill Level:** Intermediate (basic Linux command line knowledge helpful)

---

### 2. 🐳 Docker Deployment (Quick Production Setup)

**Use this if you want to:**
- Deploy quickly using containers
- Have Docker already installed
- Prefer containerized applications
- Need easy scaling and management

**👉 [Docker Deployment Guide](DEPLOYMENT.md#method-1-docker-deployment-recommended)**

**What's Included:**
- ✅ Docker and Docker Compose setup
- ✅ Container configuration
- ✅ Quick start with one command
- ✅ Easy updates and rollbacks

**Time Required:** 30-45 minutes  
**Skill Level:** Intermediate (basic Docker knowledge required)

---

### 3. 🌐 Heliohost VPS Installation (New!)

**Use this if you want to:**
- Deploy on Heliohost VPS with Hestia Control Panel
- Follow Heliohost-specific instructions
- Setup custom Node.js templates for Hestia
- Complete end-to-end Heliohost deployment

**👉 [Heliohost Installation Guide](HELIOHOST_INSTALLATION.md)**

**What's Included:**
- ✅ Heliohost VPS setup and access
- ✅ Initial server configuration
- ✅ Node.js, MongoDB, and PM2 installation
- ✅ Custom Hestia templates for Node.js applications
- ✅ Complete backend and frontend deployment
- ✅ SSL certificate configuration via Hestia
- ✅ Firewall and security setup
- ✅ Automatic backup configuration
- ✅ Maintenance and monitoring procedures
- ✅ Comprehensive troubleshooting guide

**Time Required:** 2-3 hours  
**Skill Level:** Intermediate (step-by-step instructions provided)

---

### 4. 🎛️ General Hestia Control Panel Deployment

**Use this if you want to:**
- Use Hestia Control Panel (v1.9.4) on any VPS
- Manage through a web interface
- Prefer GUI over command line

**👉 [Hestia Deployment Guide](DEPLOYMENT.md#method-2-manual-deployment-with-hestia)**

**What's Included:**
- ✅ Node.js and MongoDB installation
- ✅ Application deployment
- ✅ Hestia panel integration
- ✅ Nginx proxy configuration

**Time Required:** 1-1.5 hours  
**Skill Level:** Beginner-Intermediate

---

### 5. 💻 Local Development Setup

**Use this if you want to:**
- Develop and test locally
- Contribute to the project
- Learn how the platform works
- Customize the application

**👉 [Local Development Setup](../SETUP.md)**

**What's Included:**
- ✅ Local environment setup
- ✅ Quick start guide
- ✅ Development workflow
- ✅ Hot reload for development

**Time Required:** 15-30 minutes  
**Skill Level:** Beginner

---

## 📊 Comparison Table

| Feature | VPS Installation | Heliohost VPS | Docker | Hestia Panel | Local Dev |
|---------|-----------------|---------------|--------|--------------|-----------|
| **Best For** | Production | Production | Production | Production | Development |
| **Setup Time** | 1-2 hours | 2-3 hours | 30-45 min | 1-1.5 hours | 15-30 min |
| **Skill Level** | Intermediate | Intermediate | Intermediate | Beginner | Beginner |
| **SSL Certificate** | ✅ Included | ✅ Included | Manual | ✅ Included | ❌ Not needed |
| **Backups** | ✅ Automatic | ✅ Automatic | Manual | Manual | ❌ Not needed |
| **Monitoring** | ✅ Included | ✅ Included | Manual | Partial | ❌ Not needed |
| **Firewall** | ✅ Configured | ✅ Configured | Manual | ✅ Configured | ❌ Not needed |
| **Updates** | Easy | Easy | Very Easy | Moderate | Very Easy |
| **Resource Control** | Full | Full | Full | Moderate | Full |
| **GUI Management** | ❌ CLI only | ✅ Hestia CP | ❌ CLI only | ✅ Yes | ❌ CLI only |
| **Node.js Templates** | Manual | ✅ Included | N/A | Manual | N/A |

---

## 🚀 Quick Decision Guide

**Answer these questions to find your path:**

1. **Is this for production or development?**
   - Production → Continue to question 2
   - Development → Use [Local Development Setup](../SETUP.md)

2. **Do you have a VPS/Cloud server?**
   - Yes → Continue to question 3
   - No → Get a VPS from [DigitalOcean](https://www.digitalocean.com), [Linode](https://www.linode.com), or [Vultr](https://www.vultr.com)

3. **Do you have Docker installed?**
   - Yes, and I prefer Docker → Use [Docker Deployment](DEPLOYMENT.md#method-1-docker-deployment-recommended)
   - No, or prefer manual setup → Continue to question 4

4. **Do you have Heliohost VPS?**
   - Yes → Use [Heliohost Installation Guide](HELIOHOST_INSTALLATION.md) ⭐ Recommended
   - No → Continue to question 5

5. **Do you use Hestia Control Panel?**
   - Yes → Use [Hestia Deployment](DEPLOYMENT.md#method-2-manual-deployment-with-hestia)
   - No → Use [VPS Installation Guide](VPS_INSTALLATION.md) ⭐ **Recommended**

---

## 📋 Pre-Installation Checklist

Before starting any installation, make sure you have:

### For Production (VPS/Docker/Hestia):
- [ ] VPS or cloud server (minimum 2GB RAM)
- [ ] Ubuntu 22.04 or 20.04 LTS installed
- [ ] Domain name registered
- [ ] Domain DNS pointed to server IP
- [ ] SSH access to server
- [ ] Email account for SMTP (Gmail, SendGrid, etc.)
- [ ] Payment gateway accounts (optional, for payments)

### For Local Development:
- [ ] Node.js 16+ installed
- [ ] MongoDB 5+ installed or Docker
- [ ] Git installed
- [ ] Code editor (VS Code recommended)
- [ ] 4GB+ RAM available
- [ ] 10GB+ free disk space

---

## 🔧 Minimum Server Requirements

### Production Environment:
- **CPU**: 2 vCPUs (minimum 1)
- **RAM**: 4GB (minimum 2GB)
- **Storage**: 50GB SSD (minimum 20GB)
- **OS**: Ubuntu 22.04 LTS or 20.04 LTS
- **Network**: Public IP address
- **Bandwidth**: Unmetered or 2TB+

### Development Environment:
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 10GB free space
- **OS**: Windows, macOS, or Linux

---

## 📚 Additional Documentation

After installation, check out:

- **[API Documentation](API_REFERENCE.md)** - Complete API reference
- **[User Guide](USER_GUIDE.md)** - How to use the platform
- **[Payment Integration](PAYMENT_INTEGRATION.md)** - Setup payment gateways
- **[Features Guide](FEATURES.md)** - Platform features overview
- **[Mobile App Setup](MOBILE_APP_SETUP.md)** - Setup mobile applications

---

## 💡 Tips for Success

1. **Start with Local Development** if you're new to the platform
2. **Read the complete guide** before starting installation
3. **Have your credentials ready** (domain, email, payment gateways)
4. **Take backups** before making changes to production
5. **Test in development** before deploying to production
6. **Follow security best practices** from the guides
7. **Keep your system updated** regularly

---

## 🆘 Getting Help

If you encounter issues during installation:

1. **Check the troubleshooting section** in your chosen guide
2. **Review the logs**:
   - Application logs: `pm2 logs`
   - Nginx logs: `/var/log/nginx/error.log`
   - MongoDB logs: `/var/log/mongodb/mongod.log`
3. **Search existing issues** on [GitHub](https://github.com/mohamedaseleim/GreenDye/issues)
4. **Create a new issue** with:
   - Your installation method
   - Error messages
   - Steps to reproduce
   - System information
5. **Contact support**: support@greendye-academy.com

---

## 🎉 Ready to Start?

Choose your installation path above and follow the detailed guide. Good luck! 🌿

**Most Popular Choice:** [VPS Installation Guide](VPS_INSTALLATION.md) - Complete, production-ready setup with security and backups included.
