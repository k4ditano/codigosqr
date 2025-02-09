import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Alert,
    CircularProgress
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../config/axios';

const MiQR = () => {
    const [qrCode, setQrCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const cargarQR = useCallback(async () => {
        if (!user?.id) return;

        try {
            console.log('Cargando QR para usuario:', user.id);
            const response = await axiosClient.get(`/negocios/${user.id}/qr`);
            console.log('Respuesta del servidor:', response.data);
            
            if (response.data.codigo_qr) {
                setQrCode(response.data.codigo_qr);
            } else {
                setError('No se ha generado un código QR para este negocio');
            }
        } catch (error) {
            console.error('Error completo:', error);
            console.error('Error response:', error.response);
            setError('Error al cargar el código QR');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        cargarQR();
    }, [cargarQR]);

    const handleDownload = () => {
        if (!qrCode) return;
        const link = document.createElement('a');
        link.href = qrCode;
        link.download = `qr-${user.usuario || 'negocio'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Mi Código QR
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    Este es tu código QR único. Los clientes pueden escanearlo para acceder al formulario de registro.
                </Typography>

                {qrCode && (
                    <>
                        <Box sx={{ mb: 3 }}>
                            <img 
                                src={qrCode} 
                                alt="Código QR del negocio" 
                                style={{ maxWidth: '100%', width: '300px' }}
                            />
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownload}
                        >
                            Descargar QR
                        </Button>
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default MiQR; 