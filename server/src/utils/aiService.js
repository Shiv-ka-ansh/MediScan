import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

const MODEL_OPTIONS = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-002',
    'gemini-2.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-1.5-pro-002',
    'gemini-pro'
];

const DEFAULT_GEMINI_MODEL = 'gemini-1.5-flash';
const modelName = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

export async function listAvailableModels() {
    if (!genAI) {
        throw new Error('GEMINI_API_KEY is not configured.');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const apiVersions = ['v1', 'v1beta'];

    for (const version of apiVersions) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`);
            if (!response.ok) continue;

            const data = await response.json();

            if (data.models) {
                const availableModels = data.models
                    .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
                    .map(m => m.name.replace('models/', ''));
                console.log(`Available models (${version}):`, availableModels);
                return { version, models: availableModels };
            }
        } catch (error) {
            continue;
        }
    }

    console.warn('Could not list models from API. Will try default model options.');
    return { version: null, models: [] };
}

async function generateContentWithFallback(prompt, preferredModel = modelName) {
    const modelsToTry = preferredModel === modelName
        ? [preferredModel, ...MODEL_OPTIONS.filter(m => m !== preferredModel)]
        : [preferredModel, ...MODEL_OPTIONS];

    let lastError = null;
    const failedModels = [];

    for (const modelNameToTry of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelNameToTry });
            const result = await model.generateContent(prompt);
            if (modelNameToTry !== preferredModel) {
                console.log(`✓ Successfully using model: ${modelNameToTry}`);
            }
            return result;
        } catch (error) {
            lastError = error;
            failedModels.push(modelNameToTry);

            const is404Error = error.status === 404 ||
                             error.message?.includes('404') ||
                             error.message?.includes('not found') ||
                             error.message?.includes('is not found');

            if (is404Error) {
                console.warn(`Model ${modelNameToTry} not available (404), trying next...`);
                continue;
            }

            console.error(`Model ${modelNameToTry} error:`, error.message);
            throw error;
        }
    }

    console.error(`All ${failedModels.length} model options failed with 404:`);
    failedModels.forEach(m => console.error(`  - ${m}`));

    throw new Error(
        `No available Gemini models found. Tried: ${failedModels.join(', ')}. ` +
        `Please check your GEMINI_API_KEY and ensure you have access to at least one model. ` +
        `You can set GEMINI_MODEL environment variable to specify a model name.`
    );
}

export async function analyzeReport(text) {
    if (!genAI) {
        throw new Error('GEMINI_API_KEY is not configured on the server. Please add it to your .env file.');
    }

    try {

        const prompt = `You are a medical AI assistant. Analyze this medical report and provide:
1. A concise summary (2-3 sentences)
2. List of abnormal values or findings (bullet points)
3. Recommendations (bullet points)
4. Plain English explanation for a non-medical person (2-3 sentences)

Format your response as a valid JSON object with the following keys:
{
  "summary": "...",
  "abnormalities": ["...", "..."],
  "recommendations": ["...", "..."],
  "plainEnglish": "..."
}

Medical Report:
${text}`;

        const result = await generateContentWithFallback(prompt);
        const response = await result.response;
        const textResponse = response.text();

        const cleanedText = textResponse.replace(/^```json\n/, '').replace(/\n```$/, '').trim();

        try {
            return JSON.parse(cleanedText);
        } catch (e) {
            console.warn('JSON Parse Error, returning raw text as summary:', e);
            return {
                summary: textResponse.substring(0, 300),
                abnormalities: [],
                recommendations: [],
                plainEnglish: 'Could not parse JSON. Raw response: ' + textResponse
            };
        }
    } catch (error) {
        console.error('Gemini Analysis Error:', error.message);
        if (error.status) {
            console.error(`Status: ${error.status}, StatusText: ${error.statusText}`);
        }
        throw new Error(`AI Analysis failed: ${error.message}`);
    }
}

export async function chatWithAI(message, reportContext) {
    if (!genAI) {
        throw new Error('GEMINI_API_KEY is not configured on the server.');
    }

    try {
        const systemPrompt = `You are a helpful medical AI assistant. Answer questions about medical reports in a clear, empathetic, and non-alarming way. Always remind users to consult with healthcare professionals for medical advice.`;

        const fullPrompt = `${systemPrompt}

${reportContext ? `Context from user's medical reports:\n${reportContext}` : 'The user has no reports yet.'}

User question: ${message}`;

        const result = await generateContentWithFallback(fullPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini Chat Error:', error.message);
        if (error.status) {
            console.error(`Status: ${error.status}, StatusText: ${error.statusText}`);
        }
        throw new Error(`AI Chat failed: ${error.message}`);
    }
}
