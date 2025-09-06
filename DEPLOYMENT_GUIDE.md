# Deployment Guide

## Overview

This project consists of two parts:
1. **Frontend**: React + TypeScript + Vite (Static files)
2. **Backend**: Node.js + Express (API server)

## Deployment Options

### Option 1: GitHub Pages (Frontend Only - No AI Features)

If you want to deploy only the frontend without AI features:

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages:**
   ```bash
   npm run deploy
   ```

3. **Enable GitHub Pages:**
   - Go to your repository settings
   - Navigate to Pages section
   - Select "gh-pages" branch as source

**Note**: AI features won't work without the backend server.

### Option 2: Full Deployment (Frontend + Backend)

For full functionality including AI features:

#### Frontend Deployment

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Deploy to any static hosting:**
   - GitHub Pages
   - Netlify (static only)
   - Vercel (static only)
   - Firebase Hosting
   - AWS S3 + CloudFront

#### Backend Deployment

1. **Prepare backend:**
   ```bash
   cd backend
   npm install
   ```

2. **Set environment variables:**
   ```bash
   GEMINI_API_KEY=your_actual_api_key_here
   PORT=3001
   ```

3. **Deploy to server hosting:**
   - Railway
   - Render
   - Heroku
   - DigitalOcean App Platform
   - AWS EC2
   - Google Cloud Run

4. **Update frontend API URL:**
   - Edit `src/services/api.ts`
   - Replace `https://your-backend-domain.com` with your actual backend URL

## Recommended Hosting Combinations

### Free Options:
- **Frontend**: GitHub Pages
- **Backend**: Railway or Render

### Paid Options:
- **Frontend**: Vercel or Netlify
- **Backend**: DigitalOcean or AWS

## Step-by-Step Deployment

### 1. Deploy Backend First

Choose one of these platforms:

#### Railway (Recommended - Free tier available)
1. Go to [Railway.app](https://railway.app)
2. Connect your GitHub repository
3. Select the `backend` folder
4. Set environment variable: `GEMINI_API_KEY=your_key`
5. Deploy

#### Render
1. Go to [Render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Set build command: `npm install`
5. Set start command: `node server.js`
6. Set environment variable: `GEMINI_API_KEY=your_key`
7. Deploy

### 2. Deploy Frontend

#### GitHub Pages
1. Update `src/services/api.ts` with your backend URL
2. Run: `npm run build`
3. Run: `npm run deploy`
4. Enable GitHub Pages in repository settings

#### Netlify
1. Update `src/services/api.ts` with your backend URL
2. Connect your GitHub repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Deploy

### 3. Configure CORS

Make sure your backend allows requests from your frontend domain by updating the CORS settings in `backend/server.js` if needed.

## Environment Variables

### Backend (.env)
```bash
GEMINI_API_KEY=your_actual_api_key_here
PORT=3001
NODE_ENV=production
```

### Frontend (Update in code)
```typescript
// src/services/api.ts
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-domain.com' // Your actual backend URL
  : 'http://localhost:3001';
```

## Testing Your Deployment

1. **Test Backend:**
   ```bash
   curl https://your-backend-domain.com/health
   ```

2. **Test Frontend:**
   - Visit your frontend URL
   - Try the AI chat feature
   - Check browser console for errors

## Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Update CORS settings in backend
   - Ensure frontend URL is allowed

2. **API Key Not Working:**
   - Check environment variables are set correctly
   - Verify API key is valid

3. **Build Errors:**
   - Check Node.js version compatibility
   - Ensure all dependencies are installed

## Security Considerations

- Never expose your API key in frontend code
- Use environment variables for all sensitive data
- Enable HTTPS for production
- Consider rate limiting for API endpoints
