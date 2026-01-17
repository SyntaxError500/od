// Production API endpoint - hardcoded for reliability in builds
// Override via EXPO_PUBLIC_API_URL env var during build if needed
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://od-topaz.vercel.app/api';

// Derived host for non-API endpoints like /health
export const API_HOST = API_BASE_URL.replace(/\/api$/, '');

// Debug: log which API URL is being used
if (__DEV__) {
  console.log('[Config] Using API_BASE_URL:', API_BASE_URL);
}


