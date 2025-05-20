// Configuration for API endpoints
const config = {
  // Use environment variables in production, fallback to localhost for development
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000'
};

export default config;
