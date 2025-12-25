import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

// Mock OpenAI if no key provided
export const openai = new OpenAI({
    apiKey: apiKey || 'mock-key',
    dangerouslyAllowBrowser: false,
});

export const isMock = true; // Force Mock Mode for reliable testing
