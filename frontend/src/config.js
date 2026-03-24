const rawApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
export const API_URL = rawApiUrl.replace(/\/+$/, '');
