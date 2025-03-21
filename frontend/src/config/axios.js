import axios from 'axios';

const axiosClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// Interceptor para incluir el token en las peticiones
axiosClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para manejar respuestas y errores
axiosClient.interceptors.response.use(
    response => response,
    error => {
        console.error('Response Error:', error);
        if (error.response) {
            // La respuesta fue hecha y el servidor respondió con un código de estado
            // que cae fuera del rango 2xx
            console.error('Error en respuesta:', error.response.data);
            console.error('Status:', error.response.status);
        } else if (error.request) {
            // La petición fue hecha pero no se recibió respuesta
            console.error('No se recibió respuesta del servidor:', error.request);
        } else {
            // Ocurrió un error al configurar la petición
            console.error('Error al configurar la petición:', error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosClient;