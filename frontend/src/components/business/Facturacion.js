import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    CircularProgress,
    TextField,
    MenuItem,
    Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import clienteAxios from '../../config/axios';
import { useAuth } from '../../context/AuthContext';

const Facturacion = () => {
    const [facturas, setFacturas] = useState([]);
    const [totales, setTotales] = useState({
        total_pagado: 0,
        total_pendiente: 0,
        total_por_aceptar: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    // Filtros
    const [estado, setEstado] = useState('');
    const [desde, setDesde] = useState(null);
    const [hasta, setHasta] = useState(null);

    const obtenerFacturas = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (estado) params.append('estado', estado);
            if (desde) params.append('desde', desde.toISOString());
            if (hasta) params.append('hasta', hasta.toISOString());

            if (!user?.id) {
                setError('Error: No se pudo identificar el negocio');
                return;
            }

            const response = await clienteAxios.get(`/facturacion/negocio/${user.id}?${params}`);
            setFacturas(response.data.facturas);
            setTotales(response.data.totales);
        } catch (error) {
            console.error('Error al obtener facturas:', error);
            setError(error.response?.data?.error || 'Error al cargar la información de facturación');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        obtenerFacturas();
    }, [estado, desde, hasta]);

    const getEstadoChip = (estado) => {
        const config = {
            pendiente: { color: 'warning', label: 'Pendiente' },
            aceptada: { color: 'info', label: 'Por Pagar' },
            pagada: { color: 'success', label: 'Pagada' }
        };
        return <Chip {...config[estado]} />;
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} locale={es}>
            <Container maxWidth="lg">
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        Facturación
                    </Typography>

                    {/* Resumen de totales */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="h6" color="text.secondary">
                                    Total Pagado
                                </Typography>
                                <Typography variant="h4">
                                    {(totales?.total_pagado || 0).toFixed(2)}€
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="h6" color="text.secondary">
                                    Pendiente de Pago
                                </Typography>
                                <Typography variant="h4">
                                    {(totales?.total_pendiente || 0).toFixed(2)}€
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="h6" color="text.secondary">
                                    Por Aceptar
                                </Typography>
                                <Typography variant="h4">
                                    {(totales?.total_por_aceptar || 0).toFixed(2)}€
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Filtros */}
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Estado"
                                    value={estado}
                                    onChange={(e) => setEstado(e.target.value)}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    <MenuItem value="pendiente">Pendiente</MenuItem>
                                    <MenuItem value="aceptada">Por Pagar</MenuItem>
                                    <MenuItem value="pagada">Pagada</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <DatePicker
                                    label="Desde"
                                    value={desde}
                                    onChange={setDesde}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <DatePicker
                                    label="Hasta"
                                    value={hasta}
                                    onChange={setHasta}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Código</TableCell>
                                        <TableCell>Fecha</TableCell>
                                        <TableCell>Descuento</TableCell>
                                        <TableCell>Ingreso Extra</TableCell>
                                        <TableCell>Total</TableCell>
                                        <TableCell>Estado</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {facturas.map((factura) => (
                                        <TableRow key={factura.id}>
                                            <TableCell>{factura.codigo}</TableCell>
                                            <TableCell>
                                                {new Date(factura.fecha_emision).toLocaleDateString('es-ES')}
                                            </TableCell>
                                            <TableCell>{factura.monto_descuento}€</TableCell>
                                            <TableCell>{factura.monto_ingreso}€</TableCell>
                                            <TableCell>{factura.monto_total}€</TableCell>
                                            <TableCell>{getEstadoChip(factura.estado)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            </Container>
        </LocalizationProvider>
    );
};

export default Facturacion; 