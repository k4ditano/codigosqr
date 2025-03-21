import axios from 'axios';

// Usar la URL correcta dependiendo del entorno
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : '/api';

console.log('Configurando axiosClient con baseURL:', API_URL);

const axiosClient = axios.create({
    baseURL: API_URL,
    timeout: 15000 // Timeout de 15 segundos para evitar bloqueos largos
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
        
        // Error específico para 502 Bad Gateway
        if (error.response && error.response.status === 502) {
            console.error('Error 502 Bad Gateway: El servidor API no está disponible');
            error.userMessage = 'El servidor de la aplicación no está disponible en este momento. Por favor, intente más tarde o contacte al administrador.';
        } 
        else if (error.response) {
            // Otros errores del servidor
            console.error('Error en respuesta:', error.response.data);
            console.error('Status:', error.response.status);
        } 
        else if (error.request) {
            // Error sin respuesta
            console.error('No se recibió respuesta del servidor:', error.request);
            error.userMessage = 'No se pudo conectar con el servidor. Verifique su conexión o contacte al administrador.';
        } 
        else {
            // Error al preparar la petición
            console.error('Error al configurar la petición:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default axiosClient;