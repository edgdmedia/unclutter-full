import { apiCall } from '../utils/api';

export const authService = {
    async login(email, password) {
        try {
            const response = await apiCall('unclutter/v1/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            // If success, store auth data and return
            if (response.status === 'success' && response.data?.token) {
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                return response;
            }

            // If it's an error response, throw it to be caught by the component
            throw response;
        } catch (error) {
            throw error;
        }
    },

    async register(name, email, password) {
        try {
            const response = await apiCall('unclutter/v1/auth/register', {
                method: 'POST',
                body: JSON.stringify({ name, email, password }),
            });

            // If success, store auth data and return
            if (response.status === 'success' && response.data?.token) {
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                return response;
            }

            throw response;
        } catch (error) {
            throw error;
        }
    },

    async verifyEmail(token, userId) {
        try {
            const response = await apiCall(`unclutter/v1/auth/verify-email`, {
                method: 'POST',
                body: JSON.stringify({ token, user: userId }),
            });

            if (response.status === 'success' && response.data?.token) {
                // Update stored token and user data after verification
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                return response;
            }

            throw response;
        } catch (error) {
            throw error;
        }
    },

    async forgotPassword(email) {
        try {
            const response = await apiCall('unclutter/v1/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email })
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    async resetPassword(token, userId, password) {
        try {
            const response = await apiCall('unclutter/v1/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({
                    token,
                    user_id: userId,
                    password
                })
            });

            if (response.status === 'success' && response.data?.token) {
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response;
        } catch (error) {
            throw error;
        }
    },
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    },

    isAuthenticated() {
        return !!localStorage.getItem('authToken');
    },

    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};