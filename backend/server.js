const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Blood Group Analyzer API is running' });
});

// AI explanation endpoint
app.post('/api/explain-genetic-error', async (req, res) => {
  try {
    const { familyInputs, systems, language } = req.body;

    if (!familyInputs || !systems || !language) {
      return res.status(400).json({ 
        error: 'Missing required fields: familyInputs, systems, language' 
      });
    }

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

    res.json({ explanation: text });
  } catch (error) {
    console.error('AI explanation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate AI explanation',
      details: error.message 
    });
  }
});

// AI chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, language } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `You are "Geno", a friendly AI assistant specialized in blood group genetics and medical analysis. You help users understand blood type inheritance, compatibility, and genetic concepts.

**Guidelines:**
- Respond in ${language === 'fa' ? 'Persian (Farsi)' : 'English'}
- Be helpful, accurate, and educational
- Use medical terminology appropriately
- Keep responses concise but informative
- If asked about non-genetic topics, politely redirect to blood group topics

User message: ${message}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Blood Group Analyzer API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
