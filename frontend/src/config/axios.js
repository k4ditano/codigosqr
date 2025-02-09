import axios from 'axios';

const axiosClient = axios.create({
    baseURL: process.env.NODE_ENV === 'production' 
        ? 'http://145.223.100.119:5000/api'
        : 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para añadir el token y logs
axiosClient.interceptors.request.use(
    (config) => {
        // Añadir token de autenticación
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Logs
        console.log('Realizando petición:', {
            url: config.url,
            method: config.method,
            data: config.data
        });
        
        return config;
    },
    (error) => {
        console.error('Error en petición:', error);
        return Promise.reject(error);
    }
);

axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.log('Response Error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        console.error('Error en respuesta:', error);
        return Promise.reject(error);
    }
);

export default axiosClient; 