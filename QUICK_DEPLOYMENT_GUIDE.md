# Quick Deployment Guide - QR Code 404 Fix

## 🚨 Problem
QR code URLs like `https://greendye.org/verify/trainer/TR-74664D06` return 404 errors.

## ✅ Solution
The fix is already included in the build! Configuration files for all major hosting platforms are automatically deployed.

## 📋 Deployment Checklist

### Before Deploying
- [ ] Run `npm run build` in the `frontend` directory
- [ ] Verify these files exist in `build/` folder:
  - `.htaccess` (Apache)
  - `_redirects` (Netlify/Render)
  - `web.config` (IIS)
- [ ] Update backend URLs in config files if needed

### Apache (cPanel, Hestia, Heliohost)
- [ ] Ensure `mod_rewrite` is enabled
- [ ] Set `AllowOverride All` (or `FileInfo`) in virtual host config
- [ ] Upload entire `build/` folder contents
- [ ] Verify `.htaccess` is in the web root

### Nginx (VPS, Docker)
- [ ] Use provided Docker setup (already configured)
- [ ] Or copy `frontend/deployment/nginx/default.conf` to your nginx config
- [ ] Reload nginx: `nginx -s reload`

### IIS (Windows Server)
- [ ] Install URL Rewrite module
- [ ] Deploy `build/` folder contents including `web.config`
- [ ] Verify web.config is being read

### Netlify/Render
- [ ] Update backend URL in `build/_redirects`
- [ ] Deploy `build/` folder
- [ ] Configuration is automatic

### Vercel
- [ ] Update backend URL in `vercel.json`
- [ ] Deploy from repository root
- [ ] Vercel reads config automatically

## 🧪 Testing After Deployment

1. **Test Trainer Verification:**
   ```
   https://your-domain.com/verify/trainer/TR-XXXXXX
   ```
   ✅ Should show trainer details, not 404

2. **Test Certificate Verification:**
   ```
   https://your-domain.com/verify/certificate/CERT-XXXXXX
   ```
   ✅ Should show certificate details, not 404

3. **Test Page Refresh:**
   - Navigate to any page
   - Press F5
   - ✅ Should reload, not show 404

4. **Test QR Code Scan:**
   - Generate QR code from admin panel
   - Scan with mobile device
   - ✅ Should open verification page

## 🔧 Quick Troubleshooting

### Apache - Still Getting 404?
```bash
# Check if mod_rewrite is enabled
apache2ctl -M | grep rewrite

# Should show: rewrite_module (shared)
# If not, enable it:
sudo a2enmod rewrite
sudo systemctl restart apache2

# Check .htaccess exists in web root
ls -la /var/www/html/.htaccess

# Check file permissions
chmod 644 /var/www/html/.htaccess
```

### Nginx - Still Getting 404?
```bash
# Test nginx config
nginx -t

# Check error log
tail -f /var/log/nginx/error.log

# Reload nginx
nginx -s reload
```

### IIS - Still Getting 404?
1. Open IIS Manager
2. Select your site
3. Check if URL Rewrite module is installed
4. Verify web.config is in application root
5. Check application pool identity has read permissions

### API Not Working?
```bash
# Test backend directly
curl https://your-backend.com/api/health

# Check CORS settings in backend .env
FRONTEND_URL=https://your-domain.com

# Verify nginx/apache proxy rules for /api/*
```

## 📞 Need Help?

1. **Check deployment documentation:** `DEPLOYMENT_FIX.md`
2. **Review platform-specific guides** in the documentation
3. **Check web server error logs** for specific errors
4. **Verify environment variables** are set correctly

## 🎯 Expected Results

After proper deployment:
- ✅ QR codes work perfectly
- ✅ Direct URLs load correctly
- ✅ Page refreshes work everywhere
- ✅ API requests function normally
- ✅ Static assets load properly
- ✅ No 404 errors on valid routes

## 📁 Configuration Files Reference

| File | Platform | Location |
|------|----------|----------|
| `.htaccess` | Apache | `frontend/public/` |
| `_redirects` | Netlify | `frontend/public/` |
| `web.config` | IIS | `frontend/public/` |
| `vercel.json` | Vercel | Project root |
| `default.conf` | Nginx | `frontend/deployment/nginx/` |

All files are automatically included in the build output!
