// Backend API Configuration
// Change this URL when deploying frontend to cPanel

export const API_BASE_URL =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000'  // Development
    : 'https://ife-perfiles-backend.vercel.app';  // Production (backend en Vercel)

export const API_ENDPOINTS = {
  students: `${API_BASE_URL}/api/estudiantes`,
};

console.log('API Base URL:', API_BASE_URL);
