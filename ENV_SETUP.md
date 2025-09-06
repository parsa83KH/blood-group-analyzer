# Environment Setup Guide

## Required Environment Variables

To use the AI features of this application, you need to set up the following environment variables:

### 1. Create `.env.local` file

Create a `.env.local` file in the root directory with the following content:

```bash
# Google Gemini API Configuration
# Get your API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_actual_api_key_here

# Development Environment
NODE_ENV=development
```

### 2. Get Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key and replace `your_actual_api_key_here` in your `.env.local` file

### 3. For Production Deployment

For production deployments, set the environment variable in your hosting platform:

- **Backend Server**: Set `GEMINI_API_KEY` environment variable
- **Frontend**: Update `API_BASE_URL` in `src/services/api.ts` with your backend URL

## AI Model Configuration

The application uses **Google Gemini 2.5 Flash** model for all AI features:
- Chat functionality (Geno AI assistant)
- Genetic error explanations
- Blood type analysis explanations

## Deployment Architecture

- **Frontend**: Static files (HTML, CSS, JS) - can be hosted on any static hosting
- **Backend**: Node.js server with Express - requires server hosting
- **Database**: No database required (stateless application)

## Security Notes

- Never commit your `.env.local` file to version control
- The `.env.local` file is already included in `.gitignore`
- Keep your API key secure and don't share it publicly
- Backend server handles all API calls to protect your API key
