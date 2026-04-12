# Energica Store - Deployment Guide

## Current Setup Status

✅ **Frontend**: Running locally on http://localhost:3000  
✅ **Backend Dependencies**: Installed  
⚠️ **Backend Server**: Not running (MongoDB connection required)  
✅ **Database Configuration**: .env file created  

## Client Demo Setup (Current)

The frontend is currently configured to use the deployed backend:
- **Frontend**: http://localhost:3000 (local)
- **Backend API**: https://energica-store.preview.emergentagent.com/api (deployed)

This setup allows you to demo the application immediately to clients using the existing infrastructure.

## Deployment Options

### Option 1: Quick Client Demo (Recommended for immediate demo)

**Current Setup**: Use existing deployed backend + local frontend

**Steps**:
1. Keep frontend running locally: `npm start` (already running on http://localhost:3000)
2. Share http://localhost:3000 with client (requires them to be on same network)
3. Or use tunneling service like ngrok for remote access

**To use ngrok**:
```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3000
```
Share the ngrok URL with your client for remote access.

### Option 2: Full Local Deployment

**Requirements**: MongoDB installed locally or MongoDB Atlas setup

#### MongoDB Atlas Setup (Recommended for deployment)

1. **Create MongoDB Atlas Account**:
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free tier

2. **Create Cluster**:
   - Create new cluster (free tier M0)
   - Choose region closest to your target audience
   - Wait for cluster creation (2-5 minutes)

3. **Configure Network Access**:
   - Go to Network Access → Add IP Address
   - Allow access from anywhere (0.0.0.0/0) for demo
   - For production, restrict to specific IPs

4. **Create Database User**:
   - Go to Database Access → Add New Database User
   - Username: `energica_admin`
   - Password: (generate strong password)
   - Database User Privileges: Read and write to any database

5. **Get Connection String**:
   - Go to Database → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` with your actual password

6. **Update Backend .env**:
   ```bash
   cd backend
   # Update .env with your MongoDB Atlas connection string
   MONGO_URL=mongodb+srv://energica_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   DB_NAME=energica_store
   JWT_SECRET=your_secure_jwt_secret
   ```

7. **Start Backend Server**:
   ```bash
   cd backend
   uvicorn server:app --reload --host 0.0.0.0 --port 8000
   ```

8. **Update Frontend .env.local**:
   ```bash
   cd frontend
   # Update .env.local
   REACT_APP_BACKEND_URL=http://localhost:8000
   ```

9. **Restart Frontend**:
   ```bash
   cd frontend
   npm start
   ```

### Option 3: Cloud Deployment (Production)

#### Backend Deployment (Render/Railway/Heroku)

**Using Render**:
1. Create account at https://render.com
2. Create new Web Service
3. Connect your GitHub repository
4. Configure:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   - `MONGO_URL`: Your MongoDB Atlas connection string
   - `DB_NAME`: `energica_store`
   - `JWT_SECRET`: Generate secure secret
6. Deploy

**Using Railway**:
1. Create account at https://railway.app
2. New Project → Deploy from GitHub
3. Select Energica repository
4. Add MongoDB plugin (or use external MongoDB Atlas)
5. Configure environment variables
6. Deploy

#### Frontend Deployment (Vercel/Netlify)

**Using Vercel**:
1. Create account at https://vercel.com
2. Import project from GitHub
3. Configure:
   - Framework Preset: Create React App
   - Root Directory: `frontend`
4. Add Environment Variable:
   - `REACT_APP_BACKEND_URL`: Your deployed backend URL
5. Deploy

**Using Netlify**:
1. Create account at https://netlify.com
2. New site from Git
3. Connect GitHub repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
5. Add environment variable:
   - `REACT_APP_BACKEND_URL`: Your deployed backend URL
6. Deploy

## Testing the Application

### Manual Testing Steps

1. **Store Page**:
   - Visit http://localhost:3000
   - Browse product categories
   - Filter products by category
   - View product details

2. **Product Page**:
   - Click on any product
   - View product specifications
   - Add product to quote

3. **Quote System**:
   - Add multiple products to quote
   - Open quote drawer (bottom right)
   - Review quote items
   - Send quote via WhatsApp

4. **Admin Panel**:
   - Visit http://localhost:3000/admin/login
   - Login with admin credentials
   - Manage products (add/edit/delete)
   - View RFQ requests

### API Testing

```bash
# Test backend health
curl http://localhost:8000/api

# Test products endpoint
curl http://localhost:8000/api/products

# Test categories endpoint  
curl http://localhost:8000/api/categories
```

## Customization Guide

### Adding Products

**Via Admin Panel**:
1. Login at `/admin`
2. Go to Products section
3. Click "Add Product"
4. Fill in product details
5. Upload images (or provide URLs)
6. Save

**Via MongoDB Directly**:
```javascript
// Connect to MongoDB
use energica_store

// Add product
db.products.insertOne({
  name: "New Solar Panel",
  category: "Solar Panel",
  price: 1500,
  description: "High-efficiency solar panel",
  specifications: {
    power: "400W",
    efficiency: "21%",
    warranty: "25 years"
  },
  images: ["https://example.com/image.jpg"],
  stock: 50,
  createdAt: new Date()
})
```

### Updating Product Images

1. Upload images to cloud storage (AWS S3, Cloudinary, etc.)
2. Get image URLs
3. Update product in admin panel or MongoDB
4. Or replace category images in `backend/server.py` (CATEGORY_IMAGES dict)

### Customizing Design

**Colors & Theme**:
- Edit `design_guidelines.json` for theme settings
- Update `frontend/tailwind.config.js` for Tailwind customization

**Components**:
- Edit components in `frontend/src/components/`
- Main pages in `frontend/src/pages/`

**Typography**:
- Font families defined in `design_guidelines.json`
- Google Fonts imported in `frontend/src/index.css`

## Troubleshooting

### Frontend Issues

**Module not found errors**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Port 3000 already in use**:
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use different port
PORT=3001 npm start
```

### Backend Issues

**MongoDB connection errors**:
- Verify MongoDB Atlas connection string
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions
- Check network connectivity

**Port 8000 already in use**:
```bash
# Kill process on port 8000
npx kill-port 8000
# Or use different port
uvicorn server:app --port 8001
```

### CORS Issues

If frontend can't connect to backend:
1. Check backend CORS configuration in `server.py`
2. Ensure frontend URL is allowed
3. For local development, allow all origins (already configured)

## Security Considerations

**For Production**:
1. Use strong JWT_SECRET (generate with: `python -c "import secrets; print(secrets.token_hex(32))"`)
2. Enable MongoDB Atlas authentication
3. Restrict MongoDB IP whitelist
4. Use HTTPS for all connections
5. Implement rate limiting
6. Add input validation
7. Enable CORS only for trusted domains
8. Regular security audits

## Performance Optimization

**Frontend**:
- Build production version: `npm run build`
- Enable code splitting
- Lazy load components
- Optimize images
- Use CDN for static assets

**Backend**:
- Use connection pooling for MongoDB
- Implement caching (Redis)
- Add pagination for large datasets
- Optimize database queries
- Use CDN for static file serving

## Monitoring & Analytics

**Recommended Tools**:
- **Frontend**: Google Analytics, Sentry for error tracking
- **Backend**: LogRocket, Datadog, or New Relic
- **Database**: MongoDB Atlas monitoring
- **Performance**: Lighthouse, WebPageTest

## Backup Strategy

**Database Backups**:
- Enable MongoDB Atlas automated backups
- Schedule regular exports
- Store backups in multiple regions
- Test restoration process

**Code Backups**:
- Use Git with proper branching
- Regular commits
- Tag releases
- Backup to multiple locations

## Contact & Support

For deployment issues or questions:
- Check MongoDB Atlas documentation
- Review Render/Railway deployment guides
- Consult Vercel/Netlify documentation
- Review this guide's troubleshooting section

---

**Last Updated**: April 12, 2026  
**Version**: 1.0
