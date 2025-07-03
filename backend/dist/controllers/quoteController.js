"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quoteController = exports.QuoteController = void 0;
const customQuotes = [
    {
        q: "The only way to do great work is to love what you do.",
        a: "Steve Jobs",
        h: "The only way to do great work is to love what you do."
    },
    {
        q: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        a: "Winston Churchill",
        h: "Success is not final, failure is not fatal: it is the courage to continue that counts."
    },
    {
        q: "The future belongs to those who believe in the beauty of their dreams.",
        a: "Eleanor Roosevelt",
        h: "The future belongs to those who believe in the beauty of their dreams."
    },
    {
        q: "Don't watch the clock; do what it does. Keep going.",
        a: "Sam Levenson",
        h: "Don't watch the clock; do what it does. Keep going."
    },
    {
        q: "The only limit to our realization of tomorrow is our doubts of today.",
        a: "Franklin D. Roosevelt",
        h: "The only limit to our realization of tomorrow is our doubts of today."
    },
    {
        q: "It always seems impossible until it's done.",
        a: "Nelson Mandela",
        h: "It always seems impossible until it's done."
    },
    {
        q: "The way to get started is to quit talking and begin doing.",
        a: "Walt Disney",
        h: "The way to get started is to quit talking and begin doing."
    },
    {
        q: "Believe you can and you're halfway there.",
        a: "Theodore Roosevelt",
        h: "Believe you can and you're halfway there."
    },
    {
        q: "Quality is not an act, it is a habit.",
        a: "Aristotle",
        h: "Quality is not an act, it is a habit."
    },
    {
        q: "The best time to plant a tree was 20 years ago. The second best time is now.",
        a: "Chinese Proverb",
        h: "The best time to plant a tree was 20 years ago. The second best time is now."
    }
];
class QuoteController {
    async getRandomQuote(_req, res) {
        try {
            console.log('📖 Fetching random quote from zenquotes.io...');
            const response = await fetch('https://zenquotes.io/api/random');
            if (response.status === 429) {
                console.log('⚠️ Rate limit reached, using custom quotes as fallback');
                const randomIndex = Math.floor(Math.random() * customQuotes.length);
                const customQuote = customQuotes[randomIndex];
                if (!customQuote) {
                    throw new Error('Failed to get custom quote');
                }
                const transformedQuote = {
                    _id: `custom_quote_${Date.now()}`,
                    content: customQuote.q || '',
                    author: customQuote.a || 'Unknown',
                    tags: ['motivation', 'inspiration'],
                    authorSlug: customQuote.a?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
                    length: customQuote.q?.length || 0,
                    dateAdded: new Date().toISOString(),
                    dateModified: new Date().toISOString()
                };
                res.status(200).json({
                    success: true,
                    data: transformedQuote
                });
                return;
            }
            if (!response.ok) {
                throw new Error(`Failed to fetch quote: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            const quote = data[0];
            if (!quote) {
                throw new Error('No quote data received');
            }
            console.log('✅ Quote fetched successfully:', {
                author: quote.a,
                contentLength: quote.q?.length || 0
            });
            const transformedQuote = {
                _id: `zenquote_${Date.now()}`,
                content: quote.q || '',
                author: quote.a || 'Unknown',
                tags: [],
                authorSlug: quote.a?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
                length: quote.q?.length || 0,
                dateAdded: new Date().toISOString(),
                dateModified: new Date().toISOString()
            };
            res.status(200).json({
                success: true,
                data: transformedQuote
            });
        }
        catch (error) {
            console.error('❌ Failed to fetch quote:', error);
            console.log('🔄 Using custom quotes as fallback due to error');
            const randomIndex = Math.floor(Math.random() * customQuotes.length);
            const customQuote = customQuotes[randomIndex];
            if (!customQuote) {
                throw new Error('Failed to get custom quote');
            }
            const transformedQuote = {
                _id: `fallback_quote_${Date.now()}`,
                content: customQuote.q || '',
                author: customQuote.a || 'Unknown',
                tags: ['motivation', 'inspiration'],
                authorSlug: customQuote.a?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
                length: customQuote.q?.length || 0,
                dateAdded: new Date().toISOString(),
                dateModified: new Date().toISOString()
            };
            res.status(200).json({
                success: true,
                data: transformedQuote
            });
        }
    }
}
exports.QuoteController = QuoteController;
exports.quoteController = new QuoteController();
//# sourceMappingURL=quoteController.js.map