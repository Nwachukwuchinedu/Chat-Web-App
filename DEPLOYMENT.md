# 🚀 Deployment Guide - Chat Application to Render

## 📋 Prerequisites
- Render account (free tier available)
- Git repository with your code
- Frontend domain (for CORS configuration)

## 🔧 Deployment Steps

### 1. **Prepare Your Repository**
Make sure your repository structure looks like this:
```
chat-web-app/
├── backend/
│   ├── config/
│   ├── users/
│   ├── chat/
│   ├── requirements.txt
│   ├── build.sh
│   └── manage.py
├── frontend/
├── render.yaml
└── DEPLOYMENT.md
```

### 2. **Update Configuration**
Before deploying, update these files:

#### **render.yaml**
- Replace `"https://your-frontend-domain.com"` with your actual frontend domain
- Update `REDIS_URL` if you're using a Redis service

#### **backend/config/settings_production.py**
- Review security settings
- Update CORS origins if needed

### 3. **Deploy to Render**

#### **Option A: Using render.yaml (Recommended)**
1. Push your code to GitHub/GitLab
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New" → "Blueprint"
4. Connect your repository
5. Render will automatically detect `render.yaml` and deploy

#### **Option B: Manual Deployment**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your repository
4. Configure:
   - **Name**: `chat-backend`
   - **Environment**: `Python`
   - **Build Command**: `cd backend && chmod +x build.sh && ./build.sh`
   - **Start Command**: `cd backend && python -m daphne -b 0.0.0.0 -p $PORT config.asgi:application`
   - **Plan**: Free

### 4. **Environment Variables**
Set these in Render dashboard:

| Variable | Value | Description |
|----------|-------|-------------|
| `DJANGO_SETTINGS_MODULE` | `config.settings_production` | Production settings |
| `DATABASE_URL` | Auto-generated | PostgreSQL connection |
| `SECRET_KEY` | Auto-generated | Django secret key |
| `DEBUG` | `false` | Disable debug mode |
| `ALLOWED_HOSTS` | `.onrender.com` | Allowed hosts |
| `CORS_ALLOWED_ORIGINS` | `https://your-domain.com` | Frontend domain |
| `REDIS_URL` | `redis://localhost:6379` | Redis for WebSockets |

### 5. **Database Setup**
1. Create a PostgreSQL database in Render
2. Render will automatically provide `DATABASE_URL`
3. Migrations will run automatically during build

## 🔍 **Post-Deployment**

### **Verify Deployment**
1. Check your service URL (e.g., `https://chat-backend.onrender.com`)
2. Test the health check endpoint: `/api/auth/me/`
3. Verify WebSocket connection

### **Update Frontend**
Update your frontend API base URL:
```typescript
// frontend/src/config/env.ts
export const config = {
  apiBaseUrl: 'https://your-backend-url.onrender.com/api',
};
```

### **WebSocket Configuration**
Update WebSocket URL in frontend:
```typescript
// frontend/src/lib/websocket.ts
const wsUrl = `wss://your-backend-url.onrender.com/ws/chat/${conversationId}/?token=${token}`;
```

### **Your Frontend URL**
Your frontend is already deployed at: [https://chat-web-app-mocha.vercel.app/](https://chat-web-app-mocha.vercel.app/)

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **Build Failures**
- Check build logs in Render dashboard
- Verify `requirements.txt` has all dependencies
- Ensure `build.sh` is executable

#### **Database Connection Issues**
- Verify `DATABASE_URL` is set correctly
- Check if migrations ran successfully
- Ensure database is accessible

#### **WebSocket Issues**
- Verify `REDIS_URL` is configured
- Check if Daphne is running correctly
- Test WebSocket connection manually

#### **CORS Issues**
- Update `CORS_ALLOWED_ORIGINS` with your frontend domain
- Ensure frontend is making requests to correct backend URL

### **Logs and Monitoring**
- View logs in Render dashboard
- Monitor service health
- Check database performance

## 🔒 **Security Considerations**

### **Production Security**
- `DEBUG = False` in production
- Secure `SECRET_KEY`
- HTTPS enabled (automatic on Render)
- Proper CORS configuration
- Database connection security

### **Environment Variables**
- Never commit sensitive data
- Use Render's environment variable system
- Rotate secrets regularly

## 📈 **Scaling**

### **Free Tier Limitations**
- 750 hours/month
- Sleep after 15 minutes of inactivity
- Limited resources

### **Upgrading**
- Consider paid plans for production
- Add Redis service for better WebSocket performance
- Enable auto-scaling

## 🎉 **Success!**
Your chat application is now deployed and ready for production use!

### **Next Steps**
1. Deploy frontend to Vercel/Netlify
2. Set up custom domain
3. Configure SSL certificates
4. Set up monitoring and alerts
5. Create backup strategies 