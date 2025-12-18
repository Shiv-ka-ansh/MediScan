/**
 * AI Service for analyzing medical reports
 * Uses OpenAI API to generate summaries and insights
 */

/**
 * Analyzes medical report text and returns AI-generated insights
 * @param text - Extracted text from medical report
 * @returns AI analysis with summary, abnormalities, recommendations, and plain English explanation
 */
export async function analyzeReport(text) {
    const prompt = `You are a medical AI assistant. Analyze this medical report and provide:
1. A concise summary (2-3 sentences)
2. List of abnormal values or findings (bullet points)
3. Recommendations (bullet points)
4. Plain English explanation for a non-medical person (2-3 sentences)

Format your response as JSON:
{
  "summary": "...",
  "abnormalities": ["...", "..."],
  "recommendations": ["...", "..."],
  "plainEnglish": "..."
}

Medical Report:
${text}`;

    try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
            }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('OpenAI Error Details:', errorText);
            throw new Error(`OpenAI API error: ${res.statusText} (${res.status}) - ${errorText}`);
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || '';

        // Try to parse JSON response
        try {
            const parsed = JSON.parse(content);
            return {
                summary: parsed.summary || 'No summary available.',
                abnormalities: parsed.abnormalities || [],
                recommendations: parsed.recommendations || [],
                plainEnglish: parsed.plainEnglish || 'Unable to generate explanation.',
            };
        } catch {
            // Fallback if JSON parsing fails
            return {
                summary: content || 'No summary generated.',
                abnormalities: [],
                recommendations: [],
                plainEnglish: content || 'Unable to generate explanation.',
            };
        }
    } catch (error) {
        console.error('AI Service Error:', error);
        throw new Error('Failed to analyze report with AI');
    }
}

/**
 * Chat with AI about user's medical reports
 * @param message - User's message/question
 * @param reportContext - Context from user's reports
 * @returns AI response
 */
export async function chatWithAI(
    message,
    reportContext
) {
    const systemPrompt = `You are a helpful medical AI assistant. Answer questions about medical reports in a clear, empathetic, and non-alarming way. Always remind users to consult with healthcare professionals for medical advice.`;

    const userPrompt = reportContext
        ? `Context from user's medical reports:\n${reportContext}\n\nUser question: ${message}`
        : `User question: ${message}`;

    try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                temperature: 0.7,
            }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('OpenAI Chat API Error Details:', errorText);
            throw new Error(`OpenAI API error: ${res.statusText} (${res.status}) - ${errorText}`);
        }

        const data = await res.json();
        return data.choices?.[0]?.message?.content || 'Unable to generate response.';
    } catch (error) {
        console.error('AI Chat Error:', error);
        throw new Error('Failed to get AI response');
    }
}
