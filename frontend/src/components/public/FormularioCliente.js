import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Alert,
    CircularProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../config/axios';

const FormularioCliente = () => {
    const { businessId } = useParams();
    const navigate = useNavigate();
    const [negocio, setNegocio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        mensaje: ''
    });

    useEffect(() => {
        const cargarNegocio = async () => {
            if (!businessId) {
                setError('ID de negocio no proporcionado');
                setLoading(false);
                return;
            }

            try {
                console.log('Cargando negocio con ID:', businessId);
                const response = await axiosClient.get(`/negocios/${businessId}/public`);
                console.log('Respuesta del servidor:', response.data);
                setNegocio(response.data);
                setError('');
            } catch (error) {
                console.error('Error al cargar negocio:', error);
                if (error.response?.status === 404) {
                    setError('Negocio no encontrado');
                } else if (error.response?.status === 400) {
                    setError('ID de negocio inválido');
                } else {
                    setError('Error al cargar la información del negocio');
                }
            } finally {
                setLoading(false);
            }
        };

        cargarNegocio();
    }, [businessId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            const response = await axiosClient.post('/formularios', {
                ...formData,
                negocio_id: businessId
            });
            console.log('Formulario enviado:', response.data);
            setSuccess(true);
            setFormData({
                nombre: '',
                email: '',
                telefono: '',
                mensaje: ''
            });
        } catch (error) {
            console.error('Error al enviar formulario:', error);
            setError('Error al enviar el formulario. Por favor, intente nuevamente.');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
            <Paper sx={{ p: 3 }}>
                {negocio && (
                    <Typography variant="h5" gutterBottom>
                        Formulario de contacto - {negocio.nombre}
                    </Typography>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        ¡Formulario enviado exitosamente!
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Teléfono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        required
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Mensaje"
                        name="mensaje"
                        multiline
                        rows={4}
                        value={formData.mensaje}
                        onChange={handleChange}
                        required
                        margin="normal"
                    />
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary"
                        fullWidth
                        sx={{ mt: 2 }}
                    >
                        Enviar
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default FormularioCliente; 