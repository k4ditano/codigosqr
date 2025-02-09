import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import QrScanner from 'react-qr-scanner';
import axiosClient from '../../config/axios';

const ValidarCodigo = () => {
    const [codigo, setCodigo] = useState('');
    const [openScanner, setOpenScanner] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [error, setError] = useState('');

    const handleValidar = async (codigoValidar = codigo) => {
        try {
            const response = await axiosClient.post('/codigos/validar', {
                codigo: codigoValidar
            });
            setResultado({
                success: true,
                mensaje: response.data.mensaje,
                data: response.data.codigo
            });
            setCodigo('');
        } catch (error) {
            setError(error.response?.data?.error || 'Error al validar el código');
            setResultado(null);
        }
    };

    const handleScan = (data) => {
        if (data?.text) {
            try {
                const qrData = JSON.parse(data.text);
                if (qrData.type === 'discount' && qrData.code) {
                    setOpenScanner(false);
                    handleValidar(qrData.code);
                }
            } catch (error) {
                setError('Código QR inválido');
            }
        }
    };

    const handleError = (err) => {
        console.error(err);
        setError('Error al escanear el código QR');
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Validar Código de Descuento
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField
                        fullWidth
                        label="Código de descuento"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                    />
                    <Button 
                        variant="contained" 
                        onClick={() => handleValidar()}
                        disabled={!codigo}
                    >
                        Validar
                    </Button>
                </Box>

                <Button
                    variant="outlined"
                    startIcon={<QrCodeScannerIcon />}
                    onClick={() => setOpenScanner(true)}
                    fullWidth
                >
                    Escanear Código QR
                </Button>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {resultado && (
                <Alert 
                    severity={resultado.success ? "success" : "error"}
                    sx={{ mb: 2 }}
                >
                    {resultado.mensaje}
                </Alert>
            )}

            <Dialog
                open={openScanner}
                onClose={() => setOpenScanner(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Escanear Código QR</DialogTitle>
                <DialogContent>
                    <QrScanner
                        delay={300}
                        onError={handleError}
                        onScan={handleScan}
                        style={{ width: '100%', height: '100%' }}
                        constraints={{
                            video: { facingMode: "environment" }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenScanner(false)}>
                        Cancelar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ValidarCodigo; 