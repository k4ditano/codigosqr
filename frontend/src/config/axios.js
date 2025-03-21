import axios from 'axios';

// Determine el entorno actual (producción o desarrollo)
const isProduction = process.env.NODE_ENV === 'production';

// Usar una URL diferente según el entorno
const API_BASE_URL = isProduction 
    ? '/api' // En producción, usamos una ruta relativa (mismo dominio)
    : process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('Configurando axiosClient con baseURL:', API_BASE_URL);

const axiosClient = axios.create({
    baseURL: API_BASE_URL
});

// Interceptor para incluir el token en las peticiones
axiosClient.interceptors.request.use(config => {
    console.log('Enviando petición a:', config.url);
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
            // Agregar mensaje más descriptivo para el usuario
            error.userMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet o contacte al administrador.';
        } else {
            // Ocurrió un error al configurar la petición
            console.error('Error al configurar la petición:', error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosClient;