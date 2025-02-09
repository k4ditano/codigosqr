import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
    CircularProgress
} from '@mui/material';
import axiosClient from '../../config/axios';

const VerCanjes = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const cargarCanjes = async () => {
            try {
                const response = await axiosClient.get(`/codigos/${id}/canjes`);
                setData(response.data);
                setLoading(false);
            } catch (error) {
                setError('Error al cargar los canjes');
                setLoading(false);
            }
        };

        cargarCanjes();
    }, [id]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Detalles del Código
            </Typography>

            {data?.codigo && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Información del Código
                    </Typography>
                    <Typography>Código: {data.codigo.codigo}</Typography>
                    <Typography>Email del cliente: {data.codigo.cliente_email}</Typography>
                    <Typography>
                        Fecha de creación: {new Date(data.codigo.fecha_creacion).toLocaleString()}
                    </Typography>
                    <Typography>
                        Fecha de expiración: {new Date(data.codigo.fecha_expiracion).toLocaleString()}
                    </Typography>
                </Paper>
            )}

            <Typography variant="h6" gutterBottom>
                Historial de Canjes
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Negocio</TableCell>
                            <TableCell>Fecha de Canje</TableCell>
                            <TableCell>Método</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.canjes.map((canje) => (
                            <TableRow key={canje.id}>
                                <TableCell>{canje.negocio_nombre}</TableCell>
                                <TableCell>
                                    {new Date(canje.fecha_canje).toLocaleString()}
                                </TableCell>
                                <TableCell>{canje.metodo_canje}</TableCell>
                            </TableRow>
                        ))}
                        {data?.canjes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    No hay canjes registrados
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default VerCanjes; 