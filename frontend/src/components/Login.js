import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    Container
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../config/axios';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = location.state?.redirectTo;
    const mensaje = location.state?.mensaje;
    const { login } = useAuth();
    const [error, setError] = useState('');
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

        try {
            const user = await login(formData);
            console.log('Usuario autenticado:', user);
            
            if (redirectTo) {
                navigate(redirectTo);
            } else {
                if (user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/business');
                }
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            setError('Credenciales inválidas');
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

                {mensaje && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        {mensaje}
                    </Alert>
                )}

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
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3 }}
                    >
                        INICIAR SESIÓN
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default Login; 