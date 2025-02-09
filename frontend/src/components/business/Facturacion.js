import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    Chip,
    CircularProgress,
    Grid
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../config/axios';

const Facturacion = () => {
    const [facturacion, setFacturacion] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const cargarFacturacion = async () => {
            try {
                console.log('Cargando facturación para usuario:', user);
                const response = await axiosClient.get(`/api/facturacion/negocio/${user.id}`);
                console.log('Respuesta de facturación:', response.data);
                setFacturacion(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error detallado:', error);
                setError('Error al cargar la información de facturación');
                setLoading(false);
            }
        };

        if (user?.id) {
            cargarFacturacion();
        }
    }, [user]);

    const formatMes = (mes, año) => {
        const fecha = new Date(año, mes - 1);
        return fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
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
                Facturación
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>
                            Total Pendiente
                        </Typography>
                        <Typography variant="h4">
                            €{facturacion.reduce((acc, f) => 
                                f.estado === 'pendiente' ? acc + parseFloat(f.monto_total) : acc, 0
                            ).toFixed(2)}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>
                            Total Códigos Canjeados
                        </Typography>
                        <Typography variant="h4">
                            {facturacion.reduce((acc, f) => acc + f.total_codigos, 0)}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>
                            Total Pagado
                        </Typography>
                        <Typography variant="h4">
                            €{facturacion.reduce((acc, f) => 
                                f.estado === 'pagado' ? acc + parseFloat(f.monto_total) : acc, 0
                            ).toFixed(2)}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Período</TableCell>
                            <TableCell>Códigos Canjeados</TableCell>
                            <TableCell>Monto Total</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Fecha de Pago</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {facturacion.map((factura) => (
                            <TableRow key={factura.id}>
                                <TableCell>
                                    {formatMes(factura.mes, factura.año)}
                                </TableCell>
                                <TableCell>{factura.total_codigos}</TableCell>
                                <TableCell>€{parseFloat(factura.monto_total).toFixed(2)}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={factura.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
                                        color={factura.estado === 'pagado' ? 'success' : 'warning'}
                                    />
                                </TableCell>
                                <TableCell>
                                    {factura.fecha_pago ? 
                                        new Date(factura.fecha_pago).toLocaleDateString() : 
                                        '-'
                                    }
                                </TableCell>
                            </TableRow>
                        ))}
                        {facturacion.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No hay registros de facturación
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Facturacion; 