import api from './api';

/**
 * Chat with AI
 */
export const chatWithAI = async (
    message,
    reportId
) => {
    const response = await api.post('/chat', {
        message,
        reportId,
    });
    return response.data;
};
