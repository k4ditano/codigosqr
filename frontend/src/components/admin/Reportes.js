import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    CircularProgress,
    Alert,

    TextField
} from '@mui/material';
import {
    DownloadOutlined as DownloadIcon,

} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';
import axiosClient from '../../config/axios';

const Reportes = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalCodigos: 0,
        codigosActivos: 0,
        codigosCanjeados: 0,
        totalNegocios: 0,
        negociosActivos: 0
    });
    const [reportePeriodo, setReportePeriodo] = useState({
        codigosGenerados: [],
        codigosCanjeados: [],
        negociosRegistrados: []
    });
    const [fechaInicio, setFechaInicio] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
    const [fechaFin, setFechaFin] = useState(new Date());

    const cargarEstadisticas = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await axiosClient.get('/reportes/stats');
            setStats(response.data);
            
            const reporteResponse = await axiosClient.get('/reportes/periodo', {
                params: {
                    fechaInicio: fechaInicio.toISOString(),
                    fechaFin: fechaFin.toISOString()
                }
            });
            setReportePeriodo(reporteResponse.data);
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
            setError('Error al cargar las estadísticas. Por favor, intente de nuevo.');
        } finally {
            setLoading(false);
        }
    }, [fechaInicio, fechaFin]);

    useEffect(() => {
        cargarEstadisticas();
    }, [fechaInicio, fechaFin, cargarEstadisticas]);

    const handleDescargarReporte = async () => {
        try {
            const response = await axiosClient.get('/reportes/descargar', {
                params: {
                    fechaInicio: fechaInicio.toISOString(),
                    fechaFin: fechaFin.toISOString()
                },
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'reporte.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error al descargar reporte:', error);
            setError('Error al descargar el reporte. Por favor, intente de nuevo.');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Container maxWidth="lg">
                <Box mb={4}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Reportes y Estadísticas
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                            <Typography color="textSecondary" gutterBottom>
                                Total Códigos
                            </Typography>
                            <Typography variant="h3" component="div">
                                {stats.totalCodigos}
                            </Typography>
                            <Typography color="textSecondary">
                                {stats.codigosActivos} activos
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                            <Typography color="textSecondary" gutterBottom>
                                Códigos Canjeados
                            </Typography>
                            <Typography variant="h3" component="div">
                                {stats.codigosCanjeados}
                            </Typography>
                            <Typography color="textSecondary">
                                del total de códigos
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                            <Typography color="textSecondary" gutterBottom>
                                Negocios Activos
                            </Typography>
                            <Typography variant="h3" component="div">
                                {stats.negociosActivos}
                            </Typography>
                            <Typography color="textSecondary">
                                de {stats.totalNegocios} totales
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Paper sx={{ p: 2, mb: 4 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                        <Typography variant="h6">
                            Reporte por Período
                        </Typography>
                        <Box display="flex" gap={2}>
                            <DatePicker
                                label="Fecha inicio"
                                value={fechaInicio}
                                onChange={setFechaInicio}
                                renderInput={(params) => <TextField {...params} />}
                            />
                            <DatePicker
                                label="Fecha fin"
                                value={fechaFin}
                                onChange={setFechaFin}
                                renderInput={(params) => <TextField {...params} />}
                            />
                            <Button
                                variant="contained"
                                startIcon={<DownloadIcon />}
                                onClick={handleDescargarReporte}
                            >
                                Descargar Reporte
                            </Button>
                        </Box>
                    </Box>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell align="right">Códigos Generados</TableCell>
                                    <TableCell align="right">Códigos Canjeados</TableCell>
                                    <TableCell align="right">Negocios Registrados</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reportePeriodo.codigosGenerados.map((item, index) => (
                                    <TableRow key={item.fecha}>
                                        <TableCell>{new Date(item.fecha).toLocaleDateString()}</TableCell>
                                        <TableCell align="right">{item.cantidad}</TableCell>
                                        <TableCell align="right">
                                            {reportePeriodo.codigosCanjeados[index]?.cantidad || 0}
                                        </TableCell>
                                        <TableCell align="right">
                                            {reportePeriodo.negociosRegistrados[index]?.cantidad || 0}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Container>
        </LocalizationProvider>
    );
};

export default Reportes;
