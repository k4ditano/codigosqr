import React, { useState } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    useTheme,
    useMediaQuery
} from '@mui/material';
import QrReader from 'react-qr-reader';
import clienteAxios from '../config/axios';

const ValidarCodigo = () => {
    const [codigo, setCodigo] = useState('');
    const [escaneando, setEscaneando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [error, setError] = useState(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleScan = async (data) => {
        if (data) {
            setEscaneando(false);
            setCodigo(data);
            await validarCodigo(data);
        }
    };

    const handleError = (err) => {
        console.error(err);
        setError('Error al acceder a la cámara');
        setEscaneando(false);
    };

    const validarCodigo = async (codigoValidar) => {
        try {
            const { data } = await clienteAxios.post('/api/codigos/validar', {
                codigo: codigoValidar
            });
            setMensaje(data);
            setCodigo('');
            setTimeout(() => setMensaje(null), 3000);
        } catch (error) {
            setError(error.response?.data?.msg || 'Error al validar el código');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!codigo) {
            setError('Ingresa un código');
            return;
        }
        await validarCodigo(codigo);
    };

    return (
        <Container maxWidth="sm" sx={{ py: { xs: 2, sm: 4 } }}>
            <Paper
                elevation={3}
                sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: { xs: 1, sm: 2 }
                }}
            >
                <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                        textAlign: 'center',
                        fontSize: { xs: '1.25rem', sm: '1.5rem' },
                        mb: { xs: 2, sm: 3 }
                    }}
                >
                    Validar Código
                </Typography>

                {!escaneando ? (
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: { xs: 2, sm: 3 }
                        }}
                    >
                        <TextField
                            fullWidth
                            label="Código"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            size={isMobile ? "small" : "medium"}
                            sx={{ mb: 1 }}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            type="submit"
                            size={isMobile ? "small" : "medium"}
                        >
                            Validar
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => setEscaneando(true)}
                            size={isMobile ? "small" : "medium"}
                        >
                            Escanear QR
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ width: '100%' }}>
                        <QrReader
                            delay={300}
                            onError={handleError}
                            onScan={handleScan}
                            style={{ width: '100%' }}
                            constraints={{
                                audio: false,
                                video: {
                                    facingMode: "environment",
                                    width: { ideal: isMobile ? 720 : 1280 },
                                    height: { ideal: isMobile ? 480 : 720 }
                                }
                            }}
                        />
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => setEscaneando(false)}
                            sx={{ mt: 2 }}
                            size={isMobile ? "small" : "medium"}
                        >
                            Cancelar Escaneo
                        </Button>
                    </Box>
                )}

                {mensaje && (
                    <Alert
                        severity="success"
                        sx={{
                            mt: 2,
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                    >
                        {mensaje.texto}
                    </Alert>
                )}

                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mt: 2,
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                    >
                        {error}
                    </Alert>
                )}
            </Paper>
        </Container>
    );
};

export default ValidarCodigo;
