import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress
} from '@mui.material';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        usuario: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('Intentando login con:', {
                ...formData,
                password: '*****' // No mostrar la contraseña en logs
            });
            
            const user = await login(formData);
            console.log('Usuario autenticado:', user);
            
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/business');
            }
        } catch (error) {
            console.error('Error completo de login:', error);
            
            // Mostrar un mensaje de error apropiado según el tipo de error
            if (error.userMessage) {
                setError(error.userMessage);
            } else if (error.response) {
                if (error.response.status === 502) {
                    setError('El servidor API no está respondiendo. Por favor contacte al administrador o intente más tarde.');
                } else {
                    // Error del servidor con respuesta
                    setError(error.response.data?.error || 'Credenciales inválidas');
                }
            } else if (error.request) {
                // No hubo respuesta del servidor
                setError('No se pudo conectar con el servidor. Verifique su conexión o contacte al administrador.');
            } else {
                // Error general
                setError('Error al iniciar sesión: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f5f5f5',
            p: 2
        }}>
            <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
                <Typography variant="h5" component="h1" gutterBottom align="center">
                    Iniciar Sesión
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Usuario"
                        name="usuario"
                        value={formData.usuario}
                        onChange={handleChange}
                        margin="normal"
                        required
                        disabled={loading}
                    />
                    <TextField
                        fullWidth
                        label="Contraseña"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        margin="normal"
                        required
                        disabled={loading}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'INICIAR SESIÓN'}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default Login;