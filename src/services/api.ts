/**
 * API service for communicating with the backend
 */

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://blood-group-analyzer-api.herokuapp.com' // Update this with your actual backend URL
  : 'http://localhost:3001';

export interface GeneticErrorExplanationRequest {
  familyInputs: string;
  systems: string[];
  language: 'en' | 'fa';
}

export interface ChatRequest {
  message: string;
  language: 'en' | 'fa';
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: string;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      };
    }
  }

  async explainGeneticError(request: GeneticErrorExplanationRequest): Promise<ApiResponse<{ explanation: string }>> {
    return this.makeRequest<{ explanation: string }>('/api/explain-genetic-error', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async sendChatMessage(request: ChatRequest): Promise<ApiResponse<{ response: string }>> {
    return this.makeRequest<{ response: string }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async healthCheck(): Promise<ApiResponse<{ status: string; message: string }>> {
    return this.makeRequest<{ status: string; message: string }>('/health');
  }
}

export const apiService = new ApiService();
