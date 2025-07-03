import { useState, useEffect } from 'react';
import apiClient, { API_ENDPOINTS, ApiResponse } from '@/lib/api/config';

interface Quote {
  _id: string;
  content: string;
  author: string;
  tags: string[];
  authorSlug: string;
  length: number;
  dateAdded: string;
  dateModified: string;
}

interface QuoteState {
  quote: Quote | null;
  loading: boolean;
  error: string | null;
}

export const useQuote = () => {
  const [state, setState] = useState<QuoteState>({
    quote: null,
    loading: true,
    error: null
  });

  const fetchQuote = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await apiClient.get<ApiResponse<Quote>>(API_ENDPOINTS.QUOTES.RANDOM);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch quote');
      }
      
      setState(prev => ({ 
        ...prev, 
        quote: response.data.data || null, 
        loading: false 
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch quote';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      console.error('Error fetching quote:', err);
    }
  };

  const refreshQuote = () => {
    fetchQuote();
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return {
    quote: state.quote,
    loading: state.loading,
    error: state.error,
    refreshQuote
  };
}; 