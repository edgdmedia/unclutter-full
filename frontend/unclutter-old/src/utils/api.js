const API_BASE_URL = 'https://dash.unclutter.com.ng/wp-json/';

// Helper to handle API responses
const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'An error occurred');
    }
    return response.json();
};

// Base API call function with authentication
export const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('authToken');

    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
        mode: 'cors',
        credentials: 'include'
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        return handleResponse(response);
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};