const { GoogleGenAI } = require('@google/genai');

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
    const { familyInputs, systems, language } = JSON.parse(event.body);

    if (!familyInputs || !systems || !language) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: 'Missing required fields: familyInputs, systems, language' 
        }),
      };
    }

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const systemsText = Array.isArray(systems) ? systems.join(language === 'fa' ? ' و ' : ' and ') : systems;
    
    const prompt = `You are a world-class expert in human blood genetics. Given the following family blood types, explain the genetic incompatibility in the ${systemsText} system(s).

**Response Structure:**
- Start with a "### Summary" section containing a brief, one or two-sentence explanation of the core problem.
- Follow with a "### Detailed Explanation" section for a comprehensive analysis.

**Formatting Rules:**
- Respond ONLY in ${language === 'fa' ? 'Persian (Farsi)' : 'English'}.
- Use Markdown headings (e.g., ### Summary).
- Use double asterisks for bolding key terms (e.g., **genotype**, **allele**).
- When referring to ABO genotypes, use the standard two-letter format (e.g., **AO**, **BB**, **OO**). Do NOT use superscript notations like Iᴬ or i.
- Be direct and scientific. Do not add conversational filler, greetings, or conclusions.

**Family Inputs:**
${familyInputs}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ explanation: text }),
    };
  } catch (error) {
    console.error('AI explanation error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Failed to generate AI explanation',
        details: error.message 
      }),
    };
  }
};
