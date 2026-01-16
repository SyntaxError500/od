# Production Deployment Guide

## Pre-Deployment Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Change default admin password
- [ ] Set NODE_ENV=production
- [ ] Configure MongoDB Atlas or production database
- [ ] Update ALLOWED_ORIGINS with production URLs
- [ ] Update mobile app API_BASE_URL
- [ ] Test all endpoints
- [ ] Set up monitoring and logging
- [ ] Configure SSL/HTTPS
- [ ] Set up database backups

## Backend Deployment

### Option 1: Heroku

1. **Install Heroku CLI:**
```bash
npm install -g heroku
heroku login
```

2. **Create Heroku app:**
```bash
heroku create odins-eye-backend
```

3. **Add MongoDB Atlas addon:**
```bash
heroku addons:create mongolab:sandbox
```

Or use MongoDB Atlas and set MONGODB_URI manually.

4. **Set environment variables:**
```bash
heroku config:set JWT_SECRET=your-secret-key
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set ALLOWED_ORIGINS=https://your-frontend.com
```

5. **Deploy:**
```bash
git push heroku main
```

6. **Seed database:**
```bash
heroku run npm run seed
```

### Option 2: MongoDB Atlas + Railway/Render

1. **Create MongoDB Atlas cluster:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create free cluster
   - Get connection string
   - Whitelist your server IP (or 0.0.0.0/0 for Railway/Render)

2. **Deploy to Railway:**
   - Connect GitHub repository
   - Add environment variables
   - Deploy automatically

3. **Deploy to Render:**
   - Create new Web Service
   - Connect repository
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Add environment variables

### Option 3: AWS/DigitalOcean

1. **Set up EC2/Droplet:**
   - Create instance
   - Install Node.js and MongoDB (or use Atlas)
   - Clone repository
   - Install dependencies
   - Set up PM2 for process management

2. **PM2 Setup:**
```bash
npm install -g pm2
pm2 start server.js --name odins-eye
pm2 save
pm2 startup
```

3. **Nginx Reverse Proxy:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## MongoDB Atlas Setup

1. **Create Cluster:**
   - Sign up at mongodb.com/cloud/atlas
   - Create free M0 cluster
   - Choose region closest to your server

2. **Configure Access:**
   - Database Access: Create user with read/write permissions
   - Network Access: Whitelist IP addresses (0.0.0.0/0 for cloud hosting)

3. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password

4. **Example Connection String:**
```
mongodb+srv://username:password@cluster.mongodb.net/odins-eye?retryWrites=true&w=majority
```

## Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=generate-strong-random-secret-here
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/odins-eye
ALLOWED_ORIGINS=https://your-frontend.com,https://admin.your-domain.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-strong-password
```

## Mobile App Deployment

### Android

1. **Update config:**
   - Edit `mobile-app/config.js`
   - Set API_BASE_URL to production backend

2. **Build APK:**
```bash
cd mobile-app
expo build:android
```

3. **Or use EAS:**
```bash
eas build --platform android --profile production
```

### iOS

1. **Update config:**
   - Edit `mobile-app/config.js`
   - Set API_BASE_URL to production backend

2. **Build IPA:**
```bash
cd mobile-app
expo build:ios
```

3. **Or use EAS:**
```bash
eas build --platform ios --profile production
```

## Post-Deployment

1. **Test all endpoints:**
   - Registration
   - Login
   - QR scanning
   - Admin panel

2. **Monitor logs:**
   - Check for errors
   - Monitor database connections
   - Watch for rate limit issues

3. **Set up monitoring:**
   - Uptime monitoring (UptimeRobot, Pingdom)
   - Error tracking (Sentry)
   - Performance monitoring

4. **Backup strategy:**
   - MongoDB Atlas has automatic backups
   - Or set up manual backup schedule

## SSL/HTTPS Setup

### Using Let's Encrypt (Nginx)

1. **Install Certbot:**
```bash
sudo apt-get install certbot python3-certbot-nginx
```

2. **Get certificate:**
```bash
sudo certbot --nginx -d your-domain.com
```

3. **Auto-renewal:**
```bash
sudo certbot renew --dry-run
```

## Scaling Considerations

1. **Database Indexing:**
   - Already configured in models
   - Monitor slow queries

2. **Caching:**
   - Consider Redis for session storage
   - Cache leaderboard queries

3. **Load Balancing:**
   - Use multiple server instances
   - Load balancer (AWS ALB, Nginx)

4. **CDN:**
   - Serve static files via CDN
   - Image optimization

## Security Hardening

1. **Change default credentials**
2. **Use strong JWT_SECRET**
3. **Enable MongoDB authentication**
4. **Use HTTPS everywhere**
5. **Set up rate limiting** (already included)
6. **Regular security updates**
7. **Monitor for suspicious activity**
8. **Backup encryption**

## Monitoring & Logging

### Recommended Tools

- **Application Monitoring:** New Relic, Datadog, AppDynamics
- **Error Tracking:** Sentry, Rollbar
- **Uptime Monitoring:** UptimeRobot, Pingdom
- **Log Management:** Loggly, Papertrail

### Health Check Endpoint

Already available at `/health`

```bash
curl https://your-api.com/health
```

## Rollback Procedure

1. **Database:**
   - Restore from backup if needed
   - MongoDB Atlas has point-in-time recovery

2. **Application:**
   - Keep previous version tagged in Git
   - Revert deployment if issues occur

## Support

For issues or questions:
- Check logs first
- Review error messages
- Test endpoints individually
- Verify environment variables
- Check database connectivity


