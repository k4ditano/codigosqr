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
    Button,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaidIcon from '@mui/icons-material/Paid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import clienteAxios from '../../config/axios';

const formatMoney = (amount) => {
    return Number(amount || 0).toFixed(2) + '€';
};

const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const Facturacion = () => {
    const [resumen, setResumen] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedFactura, setSelectedFactura] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [desde, setDesde] = useState(null);
    const [hasta, setHasta] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const obtenerResumen = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (desde) params.append('desde', desde.toISOString());
            if (hasta) params.append('hasta', hasta.toISOString());

            const response = await clienteAxios.get(`/facturacion?${params}`);
            
            // Agrupar por negocio para mostrar el resumen
            const facturasPorNegocio = response.data.reduce((acc, factura) => {
                if (!acc[factura.negocio_id]) {
                    acc[factura.negocio_id] = {
                        negocio_id: factura.negocio_id,
                        negocio: factura.negocio,
                        facturas: [],
                        total_facturas: factura.total_facturas,
                        monto_pendiente: factura.monto_pendiente,
                        monto_aceptado: factura.monto_aceptado,
                        monto_pagado: factura.monto_pagado
                    };
                }
                acc[factura.negocio_id].facturas.push(factura);
                return acc;
            }, {});

            setResumen(Object.values(facturasPorNegocio));
        } catch (error) {
            console.error('Error al obtener resumen:', error);
            setError('Error al cargar la información de facturación');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        obtenerResumen();
    }, [desde, hasta]);

    const handleAceptar = async (id) => {
        try {
            // Mostrar loading
            setLoading(true);
            setError(null);

            const response = await clienteAxios.put(`/facturacion/${id}/aceptar`);
            
            // Actualizar datos
            await obtenerResumen();
            
            // Si el diálogo está abierto, actualizar los detalles
            if (openDialog && selectedFactura) {
                const negocioActual = resumen.find(r => r.negocio_id === selectedFactura.facturas[0]?.negocio_id);
                if (negocioActual) {
                    setSelectedFactura({
                        negocio: negocioActual.negocio,
                        facturas: negocioActual.facturas
                    });
                }
            }

            // Mostrar mensaje de éxito
            setSnackbar({
                open: true,
                message: 'Factura aceptada correctamente',
                severity: 'success'
            });

        } catch (error) {
            console.error('Error al aceptar la factura:', error);
            setError(error.response?.data?.error || 'Error al aceptar la factura');
            setSnackbar({
                open: true,
                message: error.response?.data?.error || 'Error al aceptar la factura',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePagar = async (id) => {
        try {
            await clienteAxios.put(`/facturacion/${id}/pagar`);
            await obtenerResumen();  // Refrescar datos generales
            
            // Si el diálogo está abierto, actualizar los detalles con los datos nuevos
            if (openDialog && selectedFactura) {
                const negocioActual = resumen.find(r => r.negocio_id === selectedFactura.facturas[0]?.negocio_id);
                if (negocioActual) {
                    setSelectedFactura({
                        negocio: negocioActual.negocio,
                        facturas: negocioActual.facturas
                    });
                }
            }
        } catch (error) {
            console.error('Error al marcar como pagada la factura:', error);
            setError('Error al marcar como pagada la factura');
        }
    };

    const verDetalles = (negocioId) => {
        const facturas = resumen.find(r => r.negocio_id === negocioId)?.facturas || [];
        setSelectedFactura({
            negocio: resumen.find(r => r.negocio_id === negocioId)?.negocio,
            facturas: facturas
        });
        setOpenDialog(true);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} locale={es}>
            <Container maxWidth="lg">
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        Gestión de Facturación
                    </Typography>

                    {/* Filtros de fecha */}
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={6}>
                                <DatePicker
                                    label="Desde"
                                    value={desde}
                                    onChange={setDesde}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
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
                                        <TableCell>Negocio</TableCell>
                                        <TableCell align="right">Total Facturas</TableCell>
                                        <TableCell align="right">Pendiente</TableCell>
                                        <TableCell align="right">Por Pagar</TableCell>
                                        <TableCell align="right">Pagado</TableCell>
                                        <TableCell>Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {resumen.map((row) => (
                                        <TableRow key={row.negocio_id}>
                                            <TableCell>{row.negocio}</TableCell>
                                            <TableCell align="right">{row.total_facturas}</TableCell>
                                            <TableCell align="right">{formatMoney(row.monto_pendiente)}</TableCell>
                                            <TableCell align="right">{formatMoney(row.monto_aceptado)}</TableCell>
                                            <TableCell align="right">{formatMoney(row.monto_pagado)}</TableCell>
                                            <TableCell>
                                                <Tooltip title="Ver Detalles">
                                                    <IconButton onClick={() => verDetalles(row.negocio_id)}>
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Aceptar Pendientes">
                                                    <IconButton 
                                                        onClick={() => handleAceptar(row.facturas[0]?.factura_id)}
                                                        disabled={!row.monto_pendiente}
                                                    >
                                                        <CheckCircleIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Marcar como Pagado">
                                                    <IconButton 
                                                        onClick={() => handlePagar(row.facturas[0]?.factura_id)}
                                                        disabled={!row.monto_aceptado}
                                                    >
                                                        <PaidIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Dialog para ver detalles */}
                    <Dialog 
                        open={openDialog} 
                        onClose={() => setOpenDialog(false)}
                        maxWidth="md"
                        fullWidth
                    >
                        <DialogTitle>
                            Detalles de Facturación - {selectedFactura?.negocio}
                        </DialogTitle>
                        <DialogContent>
                            {selectedFactura && (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>ID</TableCell>
                                                <TableCell>Fecha Emisión</TableCell>
                                                <TableCell>Fecha Aceptación</TableCell>
                                                <TableCell>Fecha Pago</TableCell>
                                                <TableCell>Estado</TableCell>
                                                <TableCell align="right">Monto</TableCell>
                                                <TableCell>Acciones</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedFactura.facturas.map((factura) => (
                                                <TableRow key={factura.factura_id}>
                                                    <TableCell>{factura.factura_id}</TableCell>
                                                    <TableCell>
                                                        <Tooltip title={`Creada: ${formatDate(factura.fecha_emision)}`}>
                                                            <span>{formatDate(factura.fecha_emision)}</span>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip title={factura.fecha_aceptacion ? 
                                                            `Aceptada: ${formatDate(factura.fecha_aceptacion)}` : 
                                                            'Pendiente de aceptación'}>
                                                            <span>
                                                                {factura.fecha_aceptacion ? 
                                                                    formatDate(factura.fecha_aceptacion) : 
                                                                    '-'}
                                                            </span>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip title={factura.fecha_pago ? 
                                                            `Pagada: ${formatDate(factura.fecha_pago)}` : 
                                                            'Pendiente de pago'}>
                                                            <span>
                                                                {factura.fecha_pago ? 
                                                                    formatDate(factura.fecha_pago) : 
                                                                    '-'}
                                                            </span>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip title={
                                                            factura.estado === 'pagada' ? 
                                                                `Creada: ${formatDate(factura.fecha_emision)}
                                                                 Aceptada: ${formatDate(factura.fecha_aceptacion)}
                                                                 Pagada: ${formatDate(factura.fecha_pago)}` :
                                                            factura.estado === 'aceptada' ? 
                                                                `Creada: ${formatDate(factura.fecha_emision)}
                                                                 Aceptada: ${formatDate(factura.fecha_aceptacion)}` :
                                                                `Creada: ${formatDate(factura.fecha_emision)}`
                                                        }>
                                                            <Chip 
                                                                label={factura.estado.toUpperCase()}
                                                                color={
                                                                    factura.estado === 'pagada' ? 'success' :
                                                                    factura.estado === 'aceptada' ? 'info' : 'warning'
                                                                }
                                                            />
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {formatMoney(factura.monto_total)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip title={
                                                            factura.estado === 'pendiente' ? 'Aceptar factura' :
                                                            factura.estado === 'aceptada' ? 'Marcar como pagada' : 
                                                            `Pagada el ${formatDate(factura.fecha_pago)}`
                                                        }>
                                                            <span>
                                                                <IconButton 
                                                                    onClick={() => handleAceptar(factura.factura_id)}
                                                                    disabled={factura.estado !== 'pendiente'}
                                                                >
                                                                    <CheckCircleIcon />
                                                                </IconButton>
                                                                <IconButton 
                                                                    onClick={() => handlePagar(factura.factura_id)}
                                                                    disabled={factura.estado !== 'aceptada'}
                                                                >
                                                                    <PaidIcon />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenDialog(false)}>Cerrar</Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Container>
        </LocalizationProvider>
    );
};

export default Facturacion; 