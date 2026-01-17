

// Single source of truth for API base; prefer HTTPS production
const PROD_API = process.env.EXPO_PUBLIC_API_URL ?? 'https://od-topaz.vercel.app/api';

export const API_BASE_URL = PROD_API;

// Derived host for non-API endpoints like /health
export const API_HOST = API_BASE_URL.replace(/\/api$/, '');


