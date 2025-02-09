import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    CircularProgress,
    Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axiosClient from '../../config/axios';

const ValidarCodigoPublico = () => {
    const { codigo } = useParams();
    const [estado, setEstado] = useState('validando'); // validando, exito, error
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        const validarCodigo = async () => {
            try {
                const response = await axiosClient.post('/codigos/validar-publico', { codigo });
                setEstado('exito');
                setMensaje(response.data.mensaje);
            } catch (error) {
                setEstado('error');
                setMensaje(error.response?.data?.error || 'Error al validar el código');
            }
        };

        if (codigo) {
            validarCodigo();
        }
    }, [codigo]);

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f5f5f5',
            p: 2
        }}>
            <Paper sx={{ p: 4, maxWidth: 400, width: '100%', textAlign: 'center' }}>
                {estado === 'validando' && (
                    <>
                        <CircularProgress sx={{ mb: 2 }} />
                        <Typography>
                            Validando código...
                        </Typography>
                    </>
                )}

                {estado === 'exito' && (
                    <Alert 
                        severity="success"
                        icon={<CheckCircleIcon fontSize="large" />}
                        sx={{ mb: 2 }}
                    >
                        <Typography variant="h6" gutterBottom>
                            ¡Código validado con éxito!
                        </Typography>
                        <Typography>
                            {mensaje}
                        </Typography>
                    </Alert>
                )}

                {estado === 'error' && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Error
                        </Typography>
                        <Typography>
                            {mensaje}
                        </Typography>
                    </Alert>
                )}
            </Paper>
        </Box>
    );
};

export default ValidarCodigoPublico; 