# Energica Store - Deployment Guide

## Account Information

**All deployment accounts use the following email:**
- **Email**: glannu.social@gmail.com
- **GitHub**: glannu/Energica repository
- **Render**: Backend deployment
- **Vercel**: Frontend deployment
- **MongoDB Atlas**: Database hosting

**Note**: Keep this information secure and update credentials if compromised.

## CORS Configuration ✅

**No CORS issues expected.** The backend has been configured to handle both development and production environments:

- **Development**: Allows all origins (`*`) for easy local development
- **Production**: Configured to accept specific origins via `CORS_ORIGINS` environment variable

## Recommended Deployment: Render + Vercel

### Why This Combination?
- **Render**: Free tier, excellent FastAPI support, easy MongoDB integration
- **Vercel**: Free tier, perfect for React apps, automatic deployments from Git
- **Professional URLs**: `energica-backend.onrender.com` and `energica-frontend.vercel.app`
- **SSL Included**: Both platforms provide free SSL certificates
- **Auto-scaling**: Easy to scale when traffic increases

---

## Step 1: Deploy Backend to Render

### 1. Create MongoDB Atlas Account (Required)
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free tier (M0 cluster)
3. Create a cluster (takes 2-5 minutes)
4. **Network Access**: Add IP `0.0.0.0/0` (allow all for demo)
5. **Database Access**: Create user with username/password
6. **Get Connection String**: Click Connect → Connect your application → Copy connection string
7. Replace `<password>` with your actual password

### 2. Create Render Account
1. Go to https://render.com
2. Sign up (GitHub account recommended)

### 3. Deploy Backend
1. Click **New** → **Web Service**
2. **Connect Repository**: Connect your GitHub repository
3. **Root Directory**: `backend`
4. **Build Command**: Leave empty (Python auto-detect)
5. **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`

### 4. Configure Environment Variables (Render)
Add these environment variables in Render dashboard:

| Variable | Value |
|----------|-------|
| `MONGO_URL` | Your MongoDB connection string |
| `DB_NAME` | Your database name (e.g., `energica`) |
| `JWT_SECRET` | A random secret key |
| `CORS_ORIGINS` | `*` (for development) or your frontend URL |
| `BACKEND_URL` | Your Render backend URL (e.g., `https://energica-backend.onrender.com`) |
| `ADMIN_EMAIL` | `admin@energicasolutions.com` |
| `ADMIN_PASSWORD` | Choose strong password |
| `CORS_ORIGINS` | `https://your-frontend-url.vercel.app` (add after frontend is deployed) |

### 5. Deploy
- Click **Deploy**
- Wait 3-5 minutes for deployment
- Note your backend URL: `https://energica-backend.onrender.com`

---

## Step 2: Deploy Frontend to Vercel

### 1. Create Vercel Account
1. Go to https://vercel.com
2. Sign up (GitHub account recommended)

### 2. Deploy Frontend
1. Click **Add New** → **Project**
2. **Import Repository**: Select your GitHub repository
3. **Root Directory**: `frontend`
4. **Framework Preset**: Create React App
5. **Build Command**: `npm run build`
6. **Output Directory**: `build`

### 3. Configure Environment Variables (Vercel)
Add this environment variable in Vercel dashboard:

| Variable | Value |
|----------|-------|
| `REACT_APP_BACKEND_URL` | Your Render backend URL (e.g., `https://energica-backend.onrender.com`) |

### 4. Deploy
- Click **Deploy**
- Wait 1-2 minutes for deployment
- Note your frontend URL: `https://energica-frontend.vercel.app`

---

## Step 3: Update CORS Configuration

After both deployments are complete:

1. Go to Render dashboard → Your backend service → Environment Variables
2. Update `CORS_ORIGINS` to: `https://your-frontend-url.vercel.app`
3. Redeploy backend (Render will auto-redeploy)

---

## Step 4: Test Deployment

1. **Frontend**: Visit your Vercel URL
2. **Browse Products**: Verify products load correctly
3. **Add to Quote**: Test quote functionality
4. **Admin Panel**: Visit `/admin/login` and test with admin credentials
5. **Console**: Check browser console for any errors

---

## Quick Alternative: Use Existing Deployed Backend

If you want to skip backend deployment and use the existing deployed backend:

1. **Deploy Frontend Only**: Follow Step 2 above
2. **Set Backend URL**: In Vercel, set `REACT_APP_BACKEND_URL` to `https://energica-store.preview.emergentagent.com`
3. **Deploy**: Frontend will connect to existing backend

**Pros**: Faster deployment, no MongoDB setup needed  
**Cons**: Limited control over backend, shared resources

---

## Troubleshooting

### CORS Errors
- **Error**: "Access-Control-Allow-Origin header is missing"
- **Fix**: Ensure `CORS_ORIGINS` in Render includes your Vercel frontend URL
- **Fix**: Check backend logs in Render dashboard

### MongoDB Connection Errors
- **Error**: "MongoDB connection failed"
- **Fix**: Verify MongoDB Atlas connection string is correct
- **Fix**: Check IP whitelist in MongoDB Atlas (0.0.0.0/0 for demo)
- **Fix**: Ensure database user has correct permissions

### Build Failures
- **Error**: "Build failed"
- **Fix**: Check build logs in Render/Vercel dashboard
- **Fix**: Ensure all dependencies are in requirements.txt/package.json
- **Fix**: Verify Node.js/Python versions match platform requirements

### Environment Variables Not Working
- **Fix**: Ensure variables are set in platform dashboard (not just .env files)
- **Fix**: Redeploy after adding environment variables
- **Fix**: Check variable names match exactly (case-sensitive)

---

## Custom Domain (Optional)

### Add Custom Domain to Vercel
1. Go to Vercel dashboard → Your project → Settings → Domains
2. Add your custom domain (e.g., `energica.yourcompany.com`)
3. Update DNS records as instructed by Vercel
4. Wait for SSL certificate to provision (automatically)

### Add Custom Domain to Render
1. Go to Render dashboard → Your service → Settings → Custom Domains
2. Add your custom domain (e.g., `api.energica.yourcompany.com`)
3. Update DNS records as instructed by Render
4. Wait for SSL certificate to provision (automatically)

---

## Monitoring & Logs

### Render (Backend)
- Dashboard → Your service → Logs
- Monitor real-time logs
- Check for errors and warnings

### Vercel (Frontend)
- Dashboard → Your project → Logs
- View build logs and runtime logs
- Check for deployment errors

---

## Cost Summary

### Free Tier Limits
- **Render**: Free tier includes 750 hours/month, 512MB RAM
- **Vercel**: Free tier includes unlimited bandwidth, 100GB bandwidth
- **MongoDB Atlas**: Free tier M0 cluster (512MB storage)

### When to Upgrade
- **Render**: When you need more RAM or persistent disk storage
- **Vercel**: When you exceed 100GB bandwidth or need team features
- **MongoDB Atlas**: When you need more than 512MB storage or better performance

---

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET
- [ ] Restrict MongoDB IP whitelist (if not using 0.0.0.0/0)
- [ ] Enable HTTPS (automatic on Render/Vercel)
- [ ] Set specific CORS origins in production
- [ ] Monitor logs for suspicious activity
- [ ] Regular security updates for dependencies

---

## Support

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **FastAPI Docs**: https://fastapi.tiangolo.com

---

## Next Steps After Deployment

1. **Test Thoroughly**: Test all features (browse, search, quote, admin)
2. **Monitor Performance**: Check Render/Vercel dashboards
3. **Set Up Alerts**: Configure error monitoring (Sentry, LogRocket)
4. **Custom Domain**: Add custom domain for professional appearance
5. **Analytics**: Add Google Analytics or similar
6. **Backup Strategy**: Enable MongoDB Atlas automated backups

---

**Deployment Time**: 15-20 minutes  
**Cost**: Free (for demo/low traffic)  
**Difficulty**: Beginner-friendly

Good luck with your deployment!
