import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://netphim-backend.onrender.com/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add request interceptor to include token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Add response interceptor to handle unauthorized
api.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Use a flag to avoid multiple alerts
        if (!window.logoutInProcess) {
            window.logoutInProcess = true;
            const msg = error.response.data?.message || 'Phiên đăng nhập hết hạn';
            alert(msg);
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
});

export const getHome = async () => {
    const res = await api.get('/home');
    return res.data;
};

export const searchMovies = async (keyword, page = 1) => {
    const res = await api.get(`/search?keyword=${keyword}&page=${page}`);
    return res.data;
};

export const getMovieDetails = async (slug, source = 'ophim') => {
    const res = await api.get(`/movie/${slug}?source=${source}`);
    return res.data;
};

export const getRelatedMovies = async (slug, source = 'ophim') => {
    const res = await api.get(`/movie/${slug}/related?source=${source}`);
    return res.data;
};

export const getCategories = async () => {
    const res = await api.get('/categories');
    const items = res.data?.data?.items || res.data;
    return Array.isArray(items) ? items : [];
};

export const getCountries = async () => {
    const res = await api.get('/countries');
    const items = res.data?.data?.items || res.data;
    return Array.isArray(items) ? items : [];
};

export const getKKPhimList = async (type, page = 1) => {
    const res = await api.get(`/kkphim/list/${type}?page=${page}`);
    return res.data;
};

export const getLocalMovies = async (page = 1) => {
    const res = await api.get(`/local-movies?page=${page}&limit=48`);
    return res.data;
};

// Admin & Auth User management
export const getUsers = async () => {
    const res = await api.get('/admin/users');
    return res.data;
};

export const adminChangePassword = async (userId, newPassword) => {
    const res = await api.post(`/admin/users/${userId}/change-password`, { newPassword });
    return res.data;
};

export const approvePasswordRequest = async (userId) => {
    const res = await api.post(`/admin/users/${userId}/approve-password`);
    return res.data;
};

export const rejectPasswordRequest = async (userId) => {
    const res = await api.post(`/admin/users/${userId}/reject-password`);
    return res.data;
};

export const deleteUser = async (userId) => {
    const res = await api.delete(`/admin/users/${userId}`);
    return res.data;
};

export const toggleFavorite = async (movieData) => {
    const res = await api.post('/user/favorite', movieData);
    return res.data;
};

export const addToHistory = async (movieData) => {
    const res = await api.post('/user/history', movieData);
    return res.data;
};

export const clearHistory = async () => {
    const res = await api.delete('/user/history');
    return res.data;
};

export const deleteHistoryItem = async (slug) => {
    const res = await api.delete(`/user/history/${slug}`);
    return res.data;
};

export const getUserProfile = async () => {
    const res = await api.get('/user/profile');
    return res.data;
};

export default api;
