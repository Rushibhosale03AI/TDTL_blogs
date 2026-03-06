import axios from 'axios';

// The base engine connected to your Django API
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
});

// -------------------------------------------------------------
// REQUEST INTERCEPTOR: Flash the VIP pass before leaving
// -------------------------------------------------------------
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// -------------------------------------------------------------
// RESPONSE INTERCEPTOR: Handle the 1-minute expiration gracefully
// -------------------------------------------------------------
api.interceptors.response.use(
    (response) => {
        // If the request works perfectly, just return the data
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If Django says "401 Unauthorized" (your 1-minute token died) AND we haven't retried yet
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark that we are trying again

            try {
                // Grab the backup Refresh Token
                const refreshToken = localStorage.getItem('refresh_token');
                
                // Ask Django for a new 1-minute Access Token
                // (Make sure this URL matches your Django urls.py for refreshing!)
                const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
                    refresh: refreshToken
                });

                // Success! Save the brand new 1-minute token to the browser
                localStorage.setItem('access_token', response.data.access);

                // Update the failed request with the NEW token and try again
                originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                return api(originalRequest);
                
            } catch (refreshError) {
                // If the Refresh Token is ALSO expired, kick them to the login screen
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('username');
                window.location.href = '/login';
            }
        }
        
        // Return any other errors (like 404 or 500) normally
        return Promise.reject(error);
    }
);

export default api;