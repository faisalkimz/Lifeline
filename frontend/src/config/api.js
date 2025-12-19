// API Configuration - centralized API URL management
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getApiUrl = (path = '') => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
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
