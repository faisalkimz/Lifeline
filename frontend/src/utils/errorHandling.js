export const extractErrorMessage = (error) => {
    if (!error) return 'An unknown error occurred';
    if (typeof error === 'string') return error;
    if (error.data?.detail) return error.data.detail;
    if (error.data?.message) return error.data.message;
    if (error.message) return error.message;
    return JSON.stringify(error);
};
