import axios from 'axios';

// Configuración simplificada para evitar problemas
const axiosClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 15000 // 15 segundos de timeout
});

// Interceptor para incluir el token en las peticiones
axiosClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Interceptor simplificado para manejar errores
axiosClient.interceptors.response.use(
    response => response,
    error => {
        console.error('Error en petición:', error.message);
        return Promise.reject(error);
    }
);

export default axiosClient;