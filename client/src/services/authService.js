import api from './api';

/**
 * Register new user
 */
export const register = async (
    name,
    email,
    password,
    role
) => {
    try {
        const response = await api.post('/auth/register', {
            name,
            email,
            password,
            role,
        });
        return response.data;
    } catch (error) {
        console.error('Registration API error:', error);
        // Re-throw to let the component handle it
        throw error;
    }
};

/**
 * Login user
 */
export const login = async (
    email,
    password
) => {
    try {
        const response = await api.post('/auth/login', {
            email,
            password,
        });
        return response.data;
    } catch (error) {
        console.error('Login API error:', error);
        // Re-throw to let the component handle it
        throw error;
    }
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};
