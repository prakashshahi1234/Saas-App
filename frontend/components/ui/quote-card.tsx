'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Quote } from 'lucide-react';
import { useQuote } from '@/hooks/useQuote';

export const QuoteCard = () => {
  const { quote, loading, error, refreshQuote } = useQuote();

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 dark:from-blue-950 dark:to-indigo-950 dark:border-blue-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Quote className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Daily Inspiration
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshQuote}
            disabled={loading}
            className="h-8 w-8 p-0 hover:bg-blue-200 dark:hover:bg-blue-800"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-3">
            <div className="h-4 bg-blue-200 dark:bg-blue-800 rounded animate-pulse"></div>
            <div className="h-4 bg-blue-200 dark:bg-blue-800 rounded animate-pulse w-3/4"></div>
            <div className="h-3 bg-blue-100 dark:bg-blue-900 rounded animate-pulse w-1/2"></div>
          </div>
        )}

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm">
            <p>Failed to load quote</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        )}

        {quote && !loading && (
          <div className="space-y-3">
            <blockquote className="text-gray-700 dark:text-gray-300 italic leading-relaxed">
              "{quote.content}"
            </blockquote>
            
            <div className="flex items-center justify-between text-sm">
              <cite className="text-blue-600 dark:text-blue-400 font-medium not-italic">
                — {quote.author}
              </cite>
              
              {quote.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {quote.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 