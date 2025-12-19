import axios from 'axios';

// EWA API Service - Fully dynamic, no hard-coded values
const EWA_BASE_URL = '/api/payroll';

// EWA Configuration API
export const ewaConfigAPI = {
    // Get company EWA configuration
    getConfig: async () => {
        const response = await axios.get(`${EWA_BASE_URL}/ewa-config/`);
        return response.data[0] || null; // Return first (should be one per company)
    },

    // Update EWA configuration (HR only)
    updateConfig: async (configId, data) => {
        const response = await axios.patch(`${EWA_BASE_URL}/ewa-config/${configId}/`, data);
        return response.data;
    },

    // Create EWA configuration (if doesn't exist)
    createConfig: async (data) => {
        const response = await axios.post(`${EWA_BASE_URL}/ewa-config/`, data);
        return response.data;
    },
};

// EWA Requests API
export const ewaRequestsAPI = {
    // Check employee eligibility
    checkEligibility: async () => {
        const response = await axios.get(`${EWA_BASE_URL}/ewa-requests/check_eligibility/`);
        return response.data;
    },

    // Get all requests (filtered by role)
    getRequests: async (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const response = await axios.get(`${EWA_BASE_URL}/ewa-requests/${params ? `?${params}` : ''}`);
        return response.data;
    },

    // Get single request details
    getRequest: async (requestId) => {
        const response = await axios.get(`${EWA_BASE_URL}/ewa-requests/${requestId}/`);
        return response.data;
    },

    // Create new EWA request
    createRequest: async (data) => {
        const response = await axios.post(`${EWA_BASE_URL}/ewa-requests/`, data);
        return response.data;
    },

    // Approve request (HR only)
    approveRequest: async (requestId) => {
        const response = await axios.post(`${EWA_BASE_URL}/ewa-requests/${requestId}/approve/`);
        return response.data;
    },

    // Reject request (HR only)
    rejectRequest: async (requestId) => {
        const response = await axios.post(`${EWA_BASE_URL}/ewa-requests/${requestId}/reject/`);
        return response.data;
    },

    // Mark as disbursed (HR only)
    disburseRequest: async (requestId) => {
        const response = await axios.post(`${EWA_BASE_URL}/ewa-requests/${requestId}/disburse/`);
        return response.data;
    },
};

// Helper function to format currency dynamically
export const formatCurrency = (amount, currency = 'UGX') => {
    return new Intl.NumberFormat('en-UG', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// Helper to calculate percentage
export const calculatePercentage = (earned, total) => {
    if (!total || total === 0) return 0;
    return Math.round((earned / total) * 100);
};

export default {
    ewaConfig: ewaConfigAPI,
    ewaRequests: ewaRequestsAPI,
    formatCurrency,
    calculatePercentage,
};
