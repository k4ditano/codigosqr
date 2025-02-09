import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Container,
    Alert,
    Grid
} from '@mui/material';
import QrScanner from 'react-qr-scanner';
import clienteAxios from '../config/axios';

const ValidarCodigo = () => {
    const [codigo, setCodigo] = useState('');
    const [mensaje, setMensaje] = useState(null);
    const [error, setError] = useState(null);
    const [escaneando, setEscaneando] = useState(false);
    const [camaraDisponible, setCamaraDisponible] = useState(true);

    const validarCodigo = async (codigoAValidar) => {
        try {
            setError(null);
            setMensaje(null);

            if (!codigoAValidar) {
                setError('Por favor ingrese un código');
                return;
            }

            const response = await clienteAxios.post('/codigos/validar', {
                codigo: codigoAValidar
            });

            setMensaje({
                tipo: 'success',
                texto: `¡Código validado! Descuento del ${response.data.descuento}%`
            });
            setCodigo('');
        } catch (error) {
            console.error('Error al validar código:', error);
            setError(error.response?.data?.error || 'Error al validar el código');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!codigo) {
            setError('Por favor ingrese un código');
            return;
        }
        await validarCodigo(codigo);
    };

    const handleScan = async (data) => {
        if (data && data.text) {
            try {
                // Extraer el código del QR
                const codigo = data.text.split('/').pop();
                await validarCodigo(codigo);
                setEscaneando(false);
            } catch (error) {
                console.error('Error al procesar QR:', error);
                setError('Error al procesar el código QR');
            }
        }
    };

    const handleError = (err) => {
        console.error('Error al escanear:', err);
        if (err.name === 'NotAllowedError') {
            setError('No se ha dado permiso para acceder a la cámara');
            setCamaraDisponible(false);
        } else if (err.name === 'NotFoundError') {
            setError('No se encontró ninguna cámara disponible');
            setCamaraDisponible(false);
        } else {
            setError('Error al acceder a la cámara');
        }
        setEscaneando(false);
    };

    const iniciarEscaneo = async () => {
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            setEscaneando(true);
            setCamaraDisponible(true);
        } catch (err) {
            handleError(err);
        }
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Validar Código de Descuento
                </Typography>

                {!escaneando ? (
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Código de descuento"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            margin="normal"
                        />
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            <Grid item xs={6}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    type="submit"
                                >
                                    Validar Código
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={iniciarEscaneo}
                                    disabled={!camaraDisponible}
                                >
                                    Escanear QR
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                ) : (
                    <Box sx={{ mt: 2 }}>
                        <QrScanner
                            delay={300}
                            onError={handleError}
                            onScan={handleScan}
                            style={{ width: '100%' }}
                            constraints={{
                                audio: false,
                                video: { 
                                    facingMode: "environment",
                                    width: { ideal: 1280 },
                                    height: { ideal: 720 }
                                }
                            }}
                        />
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => setEscaneando(false)}
                            sx={{ mt: 2 }}
                        >
                            Cancelar Escaneo
                        </Button>
                    </Box>
                )}

                {mensaje && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        {mensaje.texto}
                    </Alert>
                )}

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </Paper>
        </Container>
    );
};

export default ValidarCodigo; 