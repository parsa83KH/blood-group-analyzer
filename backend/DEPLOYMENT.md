# Backend Deployment Guide

## Quick Deployment to Heroku

1. **Install Heroku CLI** (if not already installed):
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login to Heroku**:
   ```bash
   heroku login
   ```

3. **Create a new Heroku app**:
   ```bash
   cd backend
   heroku create blood-group-analyzer-api
   ```

4. **Set environment variables**:
   ```bash
   heroku config:set GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

5. **Deploy**:
   ```bash
   git subtree push --prefix backend heroku main
   ```

6. **Update frontend API URL**:
   - Update `src/services/api.ts` with your Heroku app URL
   - Replace `https://blood-group-analyzer-api.herokuapp.com` with your actual Heroku URL

## Alternative: Deploy to Railway

1. **Go to Railway.app**
2. **Connect your GitHub repository**
3. **Select the backend folder**
4. **Set environment variable**: `GEMINI_API_KEY`
5. **Deploy**

## Alternative: Deploy to Render

1. **Go to Render.com**
2. **Create new Web Service**
3. **Connect your GitHub repository**
4. **Set build command**: `npm install`
5. **Set start command**: `npm start`
6. **Set environment variable**: `GEMINI_API_KEY`
7. **Deploy**

## Testing the Backend

After deployment, test your backend:

```bash
# Health check
curl https://your-backend-url.herokuapp.com/health

# Chat test
curl -X POST https://your-backend-url.herokuapp.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "language": "en"}'
```

## Troubleshooting

- **CORS errors**: The backend already includes CORS middleware
- **API key issues**: Make sure `GEMINI_API_KEY` is set correctly
- **Port issues**: Heroku automatically sets the PORT environment variable
