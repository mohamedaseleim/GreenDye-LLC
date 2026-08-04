# Nginx Configuration Files

This directory contains Nginx configuration files for deploying the GreenDye Academy platform.

## Files

### `nginx.conf`
The original reverse proxy configuration for Docker Compose deployments. This file sets up:
- Upstream servers for backend and frontend containers
- Reverse proxy rules for routing requests

**Use case**: Docker Compose environments where Nginx acts as a reverse proxy to frontend and backend containers.

### `nginx-spa-correct.conf` ✅ RECOMMENDED
The **corrected** Nginx configuration for React SPA routing. This file demonstrates the proper way to configure Nginx for React applications with:
- ✅ Separated location blocks (NO nesting)
- ✅ Proper `try_files` fallback for dynamic routes
- ✅ Static asset caching with correct precedence
- ✅ API and WebSocket proxying
- ✅ Security headers

**Use case**: 
- VPS deployments (Ubuntu, CentOS, etc.)
- Dedicated hosting with direct Nginx configuration
- Reference for fixing nested location block issues
- Production deployments on greendye.org

## Quick Start

### For Docker Deployments
Use `nginx.conf` - it's already configured in the Docker Compose setup.

### For VPS/Dedicated Hosting
1. Copy `nginx-spa-correct.conf` to your Nginx sites directory:
   ```bash
   sudo cp nginx-spa-correct.conf /etc/nginx/sites-available/greendye
   ```

2. Update the configuration with your domain and paths:
   ```bash
   sudo nano /etc/nginx/sites-available/greendye
   # Replace 'your-domain.com' with your actual domain
   # Update paths to match your deployment directory
   ```

3. Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/greendye /etc/nginx/sites-enabled/
   ```

4. Test and reload Nginx:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## The Nested Location Block Problem

**❌ INCORRECT** - DO NOT use this structure:
```nginx
location / {
    try_files $uri $uri/ /index.html;
    
    location ~* \.(js|css|png)$ {  # NESTED - BAD!
        expires 1y;
    }
}
```

**✅ CORRECT** - Use separate location blocks:
```nginx
location ~* \.(js|css|png)$ {  # SEPARATE - GOOD!
    expires 1y;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

## Why This Matters

Nested location blocks cause Nginx to not properly handle the `try_files` directive, resulting in:
- ❌ 404 errors for direct URL access to dynamic routes
- ❌ QR code verification pages fail to load
- ❌ Page refresh on React Router routes returns 404
- ❌ Broken single-page application functionality

With the corrected configuration:
- ✅ Dynamic routes work perfectly
- ✅ QR codes load verification pages
- ✅ Page refresh works on all routes
- ✅ Static assets are properly cached
- ✅ React Router handles all client-side navigation

## Additional Resources

- **`NGINX_CONFIGURATION_FIX.md`** - Detailed explanation of the fix
- **`docs/VPS_INSTALLATION.md`** - Complete VPS installation guide with corrected Nginx config
- **`docs/HELIOHOST_INSTALLATION.md`** - Hestia Control Panel installation with corrected config
- **`frontend/deployment/nginx/default.conf`** - Docker container Nginx config (also fixed)

## Support

If you encounter issues:
1. Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
2. Test configuration syntax: `sudo nginx -t`
3. Verify file permissions and paths
4. Review `NGINX_CONFIGURATION_FIX.md` for troubleshooting

## Last Updated
November 2024 - Fixed nested location blocks issue
