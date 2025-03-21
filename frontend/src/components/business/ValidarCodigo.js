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

    const handleOpenQRScanner = () => {
        setError('La funcionalidad de escaneo QR está temporalmente deshabilitada en la versión de producción. Por favor, ingrese el código manualmente.');
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
                    onClick={handleOpenQRScanner}
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
                <DialogTitle>Escaneo QR no disponible</DialogTitle>
                <DialogContent>
                    <Typography>
                        La funcionalidad de escaneo QR está deshabilitada en la versión de producción por problemas de compatibilidad.
                        Por favor, ingrese el código manualmente.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenScanner(false)}>
                        Aceptar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ValidarCodigo;