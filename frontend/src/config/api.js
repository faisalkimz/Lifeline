// API Configuration - centralized API URL management
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${API_URL}/api`;

export const getApiUrl = (path = '') => {
    // If it's a media path, use the base domain, otherwise use the /api/ prefix
    const base = path.startsWith('/media/') ? API_URL : API_BASE_URL;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
};

export const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return getApiUrl(path);
};

export default {
    API_BASE_URL,
    getApiUrl,
    getMediaUrl
};
