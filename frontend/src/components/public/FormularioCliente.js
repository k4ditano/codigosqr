import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress,
    CheckCircleIcon
} from '@mui/material';
import { useParams } from 'react-router-dom';
import axiosClient from '../../config/axios';

const FormularioCliente = () => {
    const { businessId } = useParams();
    const [negocio, setNegocio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: ''
    });

    const cargarNegocio = useCallback(async () => {
        try {
            const response = await axiosClient.get(`/negocios/${businessId}`);
            setNegocio(response.data);
            setLoading(false);
        } catch (error) {
            setError('Error al cargar la información del negocio');
            setLoading(false);
        }
    }, [businessId]);

    useEffect(() => {
        cargarNegocio();
    }, [cargarNegocio]);

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
        setSuccess(false);

        try {
            await axiosClient.post('/formularios', {
                ...formData,
                negocio_id: businessId
            });
            setSuccess(true);
            setFormData({
                nombre: '',
                email: '',
                telefono: ''
            });
        } catch (error) {
            setError('Error al enviar el formulario');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (success) {
        return (
            <Box sx={{ 
                minHeight: '100vh', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#f5f5f5',
                p: 2
            }}>
                <Paper sx={{ p: 4, maxWidth: 500, width: '100%', textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom color="primary">
                        ¡Gracias por tu interés!
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Hemos recibido tu información correctamente. En breve nos pondremos en contacto contigo para ofrecerte nuestras mejores ofertas y descuentos.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        El equipo de {negocio?.nombre}
                    </Typography>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            pt: 4,
            px: 2,
            bgcolor: '#f5f5f5'
        }}>
            <Paper sx={{ p: 4, maxWidth: 500, width: '100%' }}>
                <Typography variant="h5" component="h1" gutterBottom align="center">
                    {negocio?.nombre}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }} align="center">
                    Complete el formulario para recibir ofertas y descuentos exclusivos
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Nombre completo"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Teléfono"
                        name="telefono"
                        value={formData.telefono}
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
                        Enviar
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default FormularioCliente; 