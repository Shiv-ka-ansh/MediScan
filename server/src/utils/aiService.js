import OpenAI from 'openai';
import dotenv from 'dotenv';
// import { GoogleGenerativeAI } from '@google/generative-ai'; // Commented out

dotenv.config();

// --- NEW OpenRouter Configuration ---
const openrouter = process.env.OPENROUTER_API_KEY
    ? new OpenAI({
          apiKey: process.env.OPENROUTER_API_KEY,
          baseURL: 'https://openrouter.ai/api/v1',
          defaultHeaders: {
              'HTTP-Referer': process.env.CLIENT_URL || 'https://med-scan11.vercel.app',
              'X-Title': 'MediScan AI',
          },
      })
    : null;

// Primary model — cheap & reliable. Override via OPENROUTER_MODEL env var.
const DEFAULT_MODEL = 'google/gemini-2.5-flash';
const MODEL = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

// Fallback chain: if the primary model is rate-limited (429) or unavailable, try these next.
const FALLBACK_MODELS = [
    'google/gemini-2.0-flash-001',
    'google/gemini-2.5-pro',
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemma-4-31b-it:free',
];

function assertConfigured() {
    if (!openrouter) {
        throw new Error(
            'OPENROUTER_API_KEY is not configured on the server. Please add it to your .env file.'
        );
    }
}

async function chatCompletion(systemPrompt, userPrompt) {
    assertConfigured();

    const modelsToTry = [MODEL, ...FALLBACK_MODELS.filter(m => m !== MODEL)];
    let lastError = null;

    for (const modelId of modelsToTry) {
        try {
            const response = await openrouter.chat.completions.create({
                model: modelId,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
            });

            if (modelId !== MODEL) {
                console.log(`✓ Fallback model used: ${modelId}`);
            }
            return response.choices[0]?.message?.content ?? '';
        } catch (error) {
            lastError = error;
            const status = error.status || error.statusCode;
            // 429 = rate-limited, 402 = payment required, 404 = not found — try next model
            if (status === 429 || status === 402 || status === 404) {
                console.warn(`⚠️  Model ${modelId} returned ${status}, trying next fallback...`);
                continue;
            }
            // Any other error — don't retry, throw immediately
            throw error;
        }
    }

    throw lastError || new Error('All AI models failed. Please try again later.');
}

// --- Exported Functions (OpenRouter Implementation) ---

export async function analyzeReport(text) {
    assertConfigured();

    const system = `You are a highly empathetic medical AI assistant explaining lab reports to a patient without medical training. 
Analyze the provided medical report and respond with a valid JSON object only — no markdown, no code fences.

CRITICAL INSTRUCTIONS FOR EASY UNDERSTANDING:
1. Avoid complex medical jargon entirely. If you must use a medical term, immediately explain it using a simple real-world analogy.
2. Keep sentences short, reassuring, and extremely easy to understand (as if explaining to a 10-year-old).
3. Do not cause panic. Be gentle and practical.

The JSON must have exactly these keys:
{
  "summary": "A very simple 2-3 sentence overview of what this test was for and the general result.",
  "abnormalities": ["List any high/low values but explain WHAT they mean in simple terms. E.g., instead of 'Elevated LDL', say 'High bad cholesterol (LDL), which can clog blood vessels.'"],
  "recommendations": ["Simple, actionable lifestyle or dietary tips. E.g., 'Drink more water'. Always advise consulting a doctor."],
  "plainEnglish": "A fully jargon-free, comforting summary of the entire report as if you are a friendly doctor talking to a patient."
}`;

    const user = `Medical Report:\n${text}`;

    try {
        const raw = await chatCompletion(system, user);
        const cleaned = raw
            .replace(/^```json\n?/, '')
            .replace(/^```\n?/, '')
            .replace(/\n?```$/, '')
            .trim();

        try {
            return JSON.parse(cleaned);
        } catch {
            console.warn('analyzeReport: JSON parse failed, returning raw text as summary');
            return {
                summary: raw.substring(0, 300),
                abnormalities: [],
                recommendations: [],
                plainEnglish: 'Could not parse structured response. Raw: ' + raw,
            };
        }
    } catch (error) {
        console.error('OpenRouter Analysis Error:', error.message);
        throw new Error(`AI Analysis failed: ${error.message}`);
    }
}

export async function chatWithAI(message, reportContext) {
    assertConfigured();

    const system = `You are a helpful medical AI assistant. Answer questions about medical reports in a clear, empathetic, and non-alarming way. Always remind users to consult with healthcare professionals for medical advice.`;

    const user = `${reportContext ? `Context from user's medical reports:\n${reportContext}\n\n` : 'The user has no reports yet.\n\n'}User question: ${message}`;

    try {
        return await chatCompletion(system, user);
    } catch (error) {
        console.error('OpenRouter Chat Error:', error.message);
        throw new Error(`AI Chat failed: ${error.message}`);
    }
}

export const SUPPORTED_LANGUAGES = {
    hi: 'Hindi (हिंदी)',
    pa: 'Punjabi (ਪੰਜਾਬੀ)',
    bn: 'Bengali (বাংলা)',
    te: 'Telugu (తెలుగు)',
    mr: 'Marathi (ਮਰਾठी)',
    ta: 'Tamil (தமிழ்)',
    gu: 'Gujarati (ગુજરાતી)',
    kn: 'Kannada (ਕನ್ನಡ)',
    ur: 'Urdu (اردو)',
    en: 'English',
};

export async function translateReport(analysisData, targetLang) {
    assertConfigured();

    const langName = SUPPORTED_LANGUAGES[targetLang] || targetLang;

    const system = `You are a professional medical translator. Return ONLY a valid JSON object with exactly these keys: "summary", "abnormalities" (array), "recommendations" (array), "plainEnglish". No markdown, no code fences, no extra text.`;

    const user = `Translate the following medical report analysis into ${langName}. Keep medical terms accurate. Use patient-friendly language for non-technical parts. Do NOT change medical meaning.

Input (English):
${JSON.stringify(analysisData, null, 2)}`;

    try {
        const raw = await chatCompletion(system, user);
        const cleaned = raw
            .replace(/^```json\n?/, '')
            .replace(/^```\n?/, '')
            .replace(/\n?```$/, '')
            .trim();

        try {
            return JSON.parse(cleaned);
        } catch {
            console.warn('translateReport: JSON parse failed, attempting extraction');
            const match = cleaned.match(/\{[\s\S]*\}/);
            if (match) return JSON.parse(match[0]);
            throw new Error('Translation response was not valid JSON');
        }
    } catch (error) {
        console.error('OpenRouter Translation Error:', error.message);
        throw new Error(`Translation failed: ${error.message}`);
    }
}

export async function getReferenceData(query) {
    assertConfigured();

    const system = `You are a medical reference database. When given a test name or category, return ONLY a valid JSON object with NO extra text, NO markdown, NO backticks.

JSON structure:
{
  "category": "Category Name",
  "description": "1-2 line what this tests for in plain English",
  "color": "#hexcode (pick a distinct medical color, avoid purple)",
  "tests": [
    {
      "name": "Test Name",
      "unit": "unit",
      "min": number_or_null,
      "max": number_or_null,
      "max_is_infinity": false,
      "critical_low": number_or_null,
      "critical_high": number_or_null,
      "note": "important clinical note or null",
      "gender_specific": "men/women/all",
      "what_it_means": "simple 1-line explanation of what this value measures",
      "low_means": "what low values indicate clinically",
      "high_means": "what high values indicate clinically"
    }
  ],
  "preparation": "fasting/no fasting/special instructions",
  "when_to_test": "who should get this tested and when"
}

Be comprehensive. Include all sub-tests for that category. Use medically accurate reference ranges from WHO/ICMR guidelines. All text must be in English only.`;

    const user = `Give me complete reference values for: ${query}`;

    try {
        const raw = await chatCompletion(system, user);
        const cleaned = raw
            .replace(/^```json\n?/, '')
            .replace(/^```\n?/, '')
            .replace(/\n?```$/, '')
            .trim();
        return JSON.parse(cleaned);
    } catch (error) {
        console.error('getReferenceData Error:', error.message);
        throw new Error(`Failed to fetch reference data: ${error.message}`);
    }
}

export async function checkReferenceValue(testName, value) {
    assertConfigured();

    const system = `You are a medical AI assistant. Respond ONLY in valid JSON, no markdown, no extra text. All text values must be in English only. No emojis.
JSON format:
{
  "status": "normal|low|high|critical_low|critical_high|borderline_low|borderline_high",
  "normal_range": "X - Y unit",
  "unit": "unit",
  "category": "which test panel this belongs to",
  "interpretation": "plain 2-line clinical interpretation in English",
  "action": "recommended next step for patient",
  "severity_color": "#hexcode matching status severity",
  "fun_fact": "1 interesting clinical fact about this parameter"
}`;

    const user = `Test: ${testName}, Value: ${value}. Is this normal?`;

    try {
        const raw = await chatCompletion(system, user);
        const cleaned = raw
            .replace(/^```json\n?/, '')
            .replace(/^```\n?/, '')
            .replace(/\n?```$/, '')
            .trim();
        return JSON.parse(cleaned);
    } catch (error) {
        console.error('checkReferenceValue Error:', error.message);
        throw new Error(`Failed to check reference value: ${error.message}`);
    }
}

export async function listAvailableModels() {
    assertConfigured();

    try {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            },
        });
        if (!response.ok) throw new Error(`OpenRouter models API returned ${response.status}`);
        const data = await response.json();
        const models = (data.data || []).map((m) => m.id);
        console.log('Available OpenRouter models:', models.slice(0, 10), '...');
        return { models };
    } catch (error) {
        console.warn('Could not list OpenRouter models:', error.message);
        return { models: [] };
    }
}

/*
// --- OLD Gemini Implementation (Commented out) ---

const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

const MODEL_OPTIONS = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash-002',
    'gemini-1.5-pro',
    'gemini-1.5-pro-002',
    'gemini-1.5-pro-latest',
    'gemini-2.0-flash-exp',
    'gemini-pro'
];

const DEFAULT_GEMINI_MODEL = 'gemini-1.5-flash';
const modelName = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

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
            const is404Error = error.status === 404 || error.message?.includes('404');
            if (is404Error) continue;
            throw error;
        }
    }
    throw new Error(`No available Gemini models found.`);
}

export async function oldAnalyzeReport(text) {
    if (!genAI) throw new Error('GEMINI_API_KEY is not configured.');
    const prompt = `Analyze this report...`;
    const result = await generateContentWithFallback(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
}
*/
