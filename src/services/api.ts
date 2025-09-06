/**
 * API service for communicating with the backend
 */

import { directApiService } from './directApi';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Use same domain for GitHub Pages serverless functions
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
        // Add timeout for better error handling
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timeout - server is not responding';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'AI features are not available. Please deploy the backend server to enable AI functionality. See BACKEND_DEPLOYMENT.md for instructions.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      };
    }
  }

  async explainGeneticError(request: GeneticErrorExplanationRequest): Promise<ApiResponse<{ explanation: string }>> {
    // Use direct API service for production (GitHub Pages)
    if (window.location.hostname.includes('github.io')) {
      return directApiService.explainGeneticError(request);
    }
    
    return this.makeRequest<{ explanation: string }>('/api/explain-genetic-error', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async sendChatMessage(request: ChatRequest): Promise<ApiResponse<{ response: string }>> {
    // Use direct API service for production (GitHub Pages)
    if (window.location.hostname.includes('github.io')) {
      return directApiService.sendChatMessage(request);
    }
    
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
