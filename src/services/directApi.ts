/**
 * Direct API service that calls Gemini API from client-side
 * This bypasses the need for a backend server
 */

export interface ChatRequest {
  message: string;
  language: 'en' | 'fa';
}

export interface GeneticErrorExplanationRequest {
  familyInputs: string;
  systems: string[];
  language: 'en' | 'fa';
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: string;
}

class DirectApiService {
  private getApiKey(): string {
    // Get API key from environment variable
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured. Please set VITE_GEMINI_API_KEY in your environment variables.');
    }
    return apiKey;
  }

  private async makeGeminiRequest(prompt: string): Promise<string> {
    const apiKey = this.getApiKey();
    
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      throw new Error('API key is not configured. Please set your Gemini API key.');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received';
  }

  async sendChatMessage(request: ChatRequest): Promise<ApiResponse<{ response: string }>> {
    try {
      const prompt = `You are "Geno", a friendly AI assistant specialized in blood group genetics and medical analysis. You help users understand blood type inheritance, compatibility, and genetic concepts.

**Guidelines:**
- Respond in ${request.language === 'fa' ? 'Persian (Farsi)' : 'English'}
- Be helpful, accurate, and educational
- Use medical terminology appropriately
- Keep responses concise but informative
- If asked about non-genetic topics, politely redirect to blood group topics

User message: ${request.message}`;

      const response = await this.makeGeminiRequest(prompt);
      return { data: { response } };
    } catch (error) {
      console.error('Direct API chat error:', error);
      return { 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      };
    }
  }

  async explainGeneticError(request: GeneticErrorExplanationRequest): Promise<ApiResponse<{ explanation: string }>> {
    try {
      const systemsText = Array.isArray(request.systems) 
        ? request.systems.join(request.language === 'fa' ? ' و ' : ' and ') 
        : request.systems;
      
      const prompt = `You are a world-class expert in human blood genetics. Given the following family blood types, explain the genetic incompatibility in the ${systemsText} system(s).

**Response Structure:**
- Start with a "### Summary" section containing a brief, one or two-sentence explanation of the core problem.
- Follow with a "### Detailed Explanation" section for a comprehensive analysis.

**Formatting Rules:**
- Respond ONLY in ${request.language === 'fa' ? 'Persian (Farsi)' : 'English'}.
- Use Markdown headings (e.g., ### Summary).
- Use double asterisks for bolding key terms (e.g., **genotype**, **allele**).
- When referring to ABO genotypes, use the standard two-letter format (e.g., **AO**, **BB**, **OO**). Do NOT use superscript notations like Iᴬ or i.
- Be direct and scientific. Do not add conversational filler, greetings, or conclusions.

**Family Inputs:**
${request.familyInputs}`;

      const explanation = await this.makeGeminiRequest(prompt);
      return { data: { explanation } };
    } catch (error) {
      console.error('Direct API explanation error:', error);
      return { 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      };
    }
  }

  async healthCheck(): Promise<ApiResponse<{ status: string; message: string }>> {
    return { 
      data: { 
        status: 'OK', 
        message: 'Direct API service is running' 
      } 
    };
  }
}

export const directApiService = new DirectApiService();
