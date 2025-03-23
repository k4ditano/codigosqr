import axios from 'axios';

const axiosClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para añadir el token a todas las peticiones
axiosClient.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Interceptor para logging de peticiones
axiosClient.interceptors.request.use(
    config => {
        console.log('Realizando petición:', {
            url: config.url,
            method: config.method,
            data: config.data
        });
        return config;
    },
    error => {
        console.error('Error en petición:', error);
        return Promise.reject(error);
    }
);

// Interceptor para logging de respuestas
axiosClient.interceptors.response.use(
    response => {
        console.log('Response:', {
            status: response.status,
            data: response.data,
            headers: response.headers
        });
        if (response.config.url.includes('/codigos')) {
            console.log('Respuesta de códigos:', {
                url: response.config.url,
                data: response.data
            });
        }
        return response;
    },
    error => {
        console.error('Response Error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        console.error('Error en respuesta:', error);
        return Promise.reject(error);
    }
);

export default axiosClient; 