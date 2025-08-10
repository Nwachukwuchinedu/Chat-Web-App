// Environment configuration
export const config = {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://chat-web-app-wh20.onrender.com/api' : 'http://localhost:8000/api'),
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
} as const;

// Validate required environment variables
if (!config.apiBaseUrl) {
    console.error('VITE_API_BASE_URL is not set. Please create a .env file with VITE_API_BASE_URL=http://localhost:8000/api');
} 