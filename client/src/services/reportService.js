import api from './api';

/**
 * Upload medical report
 */
export const uploadReport = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/reports/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Get all user reports
 */
export const getUserReports = async () => {
    const response = await api.get('/reports');
    return response.data;
};

/**
 * Get single report by ID
 */
export const getReport = async (id) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
};

/**
 * Get pending reports (for doctors)
 */
export const getPendingReports = async () => {
    const response = await api.get('/reports/pending/all');
    return response.data;
};

/**
 * Review report (for doctors)
 */
export const reviewReport = async (
    id,
    status,
    comments
) => {
    const response = await api.put(`/reports/${id}/review`, {
        status,
        comments,
    });
    return response.data;
};

/**
 * Delete report
 */
export const deleteReport = async (id) => {
    await api.delete(`/reports/${id}`);
};

/**
 * Get reviewed reports (for doctors - history)
 */
export const getReviewedReports = async () => {
    const response = await api.get('/reports/reviewed');
    return response.data;
};

/**
 * Fetch list of supported translation languages
 */
export const getSupportedLanguages = async () => {
    const response = await api.get('/reports/languages');
    return response.data;
};

/**
 * Translate a report's AI analysis to a target language
 * @param {string} id - Report ID
 * @param {string} lang - Language code e.g. 'hi', 'pa', 'bn'
 */
export const translateReport = async (id, lang) => {
    const response = await api.get(`/reports/${id}/translate`, {
        params: { lang },
    });
    return response.data;
};
