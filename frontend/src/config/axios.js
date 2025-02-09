import axios from 'axios';

const axiosClient = axios.create({
    baseURL: process.env.NODE_ENV === 'production' 
        ? 'http://145.223.100.119:5000/api'
        : 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true
});

// Interceptor para añadir el token y logs
axiosClient.interceptors.request.use(
    (config) => {
        // Añadir token de autenticación
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Logs más detallados
        console.log('Realizando petición:', {
            url: config.url,
            method: config.method,
            data: config.data,
            headers: config.headers
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
        console.log('Respuesta recibida:', {
            status: response.status,
            data: response.data,
            headers: response.headers
        });
        return response;
    },
    (error) => {
        console.log('Error en respuesta:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            config: error.config
        });
        return Promise.reject(error);
    }
);

export default axiosClient; 