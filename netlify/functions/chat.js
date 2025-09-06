const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { message, language } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }

    // Check if API key is available
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          response: language === 'fa' 
            ? 'متأسفانه API key تنظیم نشده است. لطفاً GEMINI_API_KEY را در تنظیمات Netlify تنظیم کنید.'
            : 'API key is not configured. Please set GEMINI_API_KEY in Netlify settings.'
        }),
      };
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const systemPrompt = `You are "Geno", a friendly AI assistant specialized in blood group genetics and medical analysis. You help users understand blood type inheritance, compatibility, and genetic concepts.

**Guidelines:**
- Respond in ${language === 'fa' ? 'Persian (Farsi)' : 'English'}
- Be helpful, accurate, and educational
- Use medical terminology appropriately
- Keep responses concise but informative
- If asked about non-genetic topics, politely redirect to blood group topics

User message: ${message}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ response: text }),
    };
  } catch (error) {
    console.error('AI chat error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      stack: error.stack
    });
    
    // Provide more specific error messages
    let errorMessage = 'Failed to process chat message';
    let errorDetails = error.message;
    
    if (error.message && error.message.includes('VPN')) {
      errorMessage = language === 'fa' 
        ? 'خطا در دسترسی به API. لطفاً اتصال اینترنت خود را بررسی کنید.'
        : 'API access error. Please check your internet connection.';
    } else if (error.message && error.message.includes('quota')) {
      errorMessage = language === 'fa'
        ? 'محدودیت استفاده از API. لطفاً بعداً دوباره تلاش کنید.'
        : 'API quota exceeded. Please try again later.';
    } else if (error.message && error.message.includes('permission')) {
      errorMessage = language === 'fa'
        ? 'خطا در مجوزهای API. لطفاً API key را بررسی کنید.'
        : 'API permission error. Please check your API key.';
    }
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: errorMessage,
        details: errorDetails,
        debug: {
          code: error.code,
          status: error.status
        }
      }),
    };
  }
};
