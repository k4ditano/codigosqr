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
    Chip,
    useTheme,
    useMediaQuery
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

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const obtenerResumen = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (desde) params.append('desde', desde.toISOString());
            if (hasta) params.append('hasta', hasta.toISOString());

            const response = await clienteAxios.get(`/facturacion?${params}`);

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
            setLoading(true);
            setError(null);

            await clienteAxios.put(`/facturacion/${id}/aceptar`);
            await obtenerResumen();

            if (openDialog && selectedFactura) {
                const negocioActual = resumen.find(r => r.negocio_id === selectedFactura.facturas[0]?.negocio_id);
                if (negocioActual) {
                    setSelectedFactura({
                        negocio: negocioActual.negocio,
                        facturas: negocioActual.facturas
                    });
                }
            }

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
            await obtenerResumen();

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
                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                            fontSize: { xs: '1.5rem', sm: '2rem' },
                            mb: { xs: 2, sm: 3 }
                        }}
                    >
                        Gestión de Facturación
                    </Typography>

                    {/* Filtros de fecha */}
                    <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }} className="responsive-table-container">
                        <Typography
                            variant="h6"
                            gutterBottom
                            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                        >
                            Filtros
                        </Typography>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={6}>
                                <DatePicker
                                    label="Desde"
                                    value={desde}
                                    onChange={setDesde}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            size: isMobile ? "small" : "medium"
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <DatePicker
                                    label="Hasta"
                                    value={hasta}
                                    onChange={setHasta}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            size: isMobile ? "small" : "medium"
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 2,
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <TableContainer component={Paper} className="responsive-table-container">
                            <Table size={isMobile ? "small" : "medium"}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Negocio</TableCell>
                                        <TableCell align="right">Total</TableCell>
                                        {!isMobile && <TableCell align="right">Pendiente</TableCell>}
                                        <TableCell align="right">Por Pagar</TableCell>
                                        {!isTablet && <TableCell align="right">Pagado</TableCell>}
                                        <TableCell>Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {resumen.map((row) => (
                                        <TableRow key={row.negocio_id}>
                                            <TableCell>{row.negocio}</TableCell>
                                            <TableCell align="right">{row.total_facturas}</TableCell>
                                            {!isMobile && (
                                                <TableCell align="right">
                                                    {formatMoney(row.monto_pendiente)}
                                                </TableCell>
                                            )}
                                            <TableCell align="right">
                                                {formatMoney(row.monto_aceptado)}
                                            </TableCell>
                                            {!isTablet && (
                                                <TableCell align="right">
                                                    {formatMoney(row.monto_pagado)}
                                                </TableCell>
                                            )}
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Tooltip title="Ver Detalles">
                                                        <IconButton
                                                            onClick={() => verDetalles(row.negocio_id)}
                                                            size={isMobile ? "small" : "medium"}
                                                        >
                                                            <VisibilityIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Aceptar Pendientes">
                                                        <IconButton
                                                            onClick={() => handleAceptar(row.facturas[0]?.factura_id)}
                                                            disabled={!row.monto_pendiente}
                                                            size={isMobile ? "small" : "medium"}
                                                        >
                                                            <CheckCircleIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Marcar como Pagado">
                                                        <IconButton
                                                            onClick={() => handlePagar(row.facturas[0]?.factura_id)}
                                                            disabled={!row.monto_aceptado}
                                                            size={isMobile ? "small" : "medium"}
                                                        >
                                                            <PaidIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
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
                        fullScreen={isMobile}
                    >
                        <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                            Detalles de Facturación - {selectedFactura?.negocio}
                        </DialogTitle>
                        <DialogContent>
                            {selectedFactura && (
                                <TableContainer>
                                    <Table size={isMobile ? "small" : "medium"}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>ID</TableCell>
                                                {!isMobile && <TableCell>Fecha Emisión</TableCell>}
                                                <TableCell>Estado</TableCell>
                                                <TableCell align="right">Monto</TableCell>
                                                <TableCell>Acciones</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedFactura.facturas.map((factura) => (
                                                <TableRow key={factura.factura_id}>
                                                    <TableCell>{factura.factura_id}</TableCell>
                                                    {!isMobile && (
                                                        <TableCell>
                                                            {formatDate(factura.fecha_emision)}
                                                        </TableCell>
                                                    )}
                                                    <TableCell>
                                                        <Chip
                                                            label={factura.estado.toUpperCase()}
                                                            color={
                                                                factura.estado === 'pagada' ? 'success' :
                                                                    factura.estado === 'aceptada' ? 'info' : 'warning'
                                                            }
                                                            size={isMobile ? "small" : "medium"}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {formatMoney(factura.monto_total)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <Tooltip title="Aceptar">
                                                                <IconButton
                                                                    onClick={() => handleAceptar(factura.factura_id)}
                                                                    disabled={factura.estado !== 'pendiente'}
                                                                    size={isMobile ? "small" : "medium"}
                                                                >
                                                                    <CheckCircleIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Marcar Pagada">
                                                                <IconButton
                                                                    onClick={() => handlePagar(factura.factura_id)}
                                                                    disabled={factura.estado !== 'aceptada'}
                                                                    size={isMobile ? "small" : "medium"}
                                                                >
                                                                    <PaidIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
                            <Button
                                onClick={() => setOpenDialog(false)}
                                size={isMobile ? "small" : "medium"}
                            >
                                Cerrar
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Snackbar para mensajes */}
                    <Alert
                        open={snackbar.open}
                        autoHideDuration={6000}
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                        severity={snackbar.severity}
                        sx={{
                            position: 'fixed',
                            bottom: { xs: 16, sm: 24 },
                            right: { xs: 16, sm: 24 },
                            zIndex: 2000
                        }}
                    >
                        {snackbar.message}
                    </Alert>
                </Box>
            </Container>
        </LocalizationProvider>
    );
};

export default Facturacion;
