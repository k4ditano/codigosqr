import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
    TextField,
    InputAdornment,
    Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../config/axios';

const HistorialCanjes = () => {
    const [canjes, setCanjes] = useState([]);
    const [filteredCanjes, setFilteredCanjes] = useState([]);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();

    const cargarCanjes = useCallback(async () => {
        try {
            const response = await axiosClient.get(`/codigos/canjes/negocio/${user.id}`);
            setCanjes(response.data);
            setFilteredCanjes(response.data);
        } catch (error) {
            setError('Error al cargar el historial de canjes');
        }
    }, [user.id]);

    const filterCanjes = useCallback(() => {
        const filtered = canjes.filter(canje => 
            canje.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            canje.cliente_email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCanjes(filtered);
    }, [canjes, searchTerm]);

    useEffect(() => {
        cargarCanjes();
    }, [cargarCanjes]);

    useEffect(() => {
        filterCanjes();
    }, [filterCanjes]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return dateString; // Ya viene formateada desde el backend
    };

    const formatMoney = (amount) => {
        return Number(amount || 0).toFixed(2) + '€';
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Historial de Canjes
            </Typography>

            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Buscar por código..."
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        )
                    }}
                />
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Código</TableCell>
                            <TableCell>Fecha de Canje</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCanjes.map((canje) => (
                            <TableRow key={canje.id}>
                                <TableCell>{canje.codigo || 'N/A'}</TableCell>
                                <TableCell>{canje.fecha_canje || 'N/A'}</TableCell>
                            </TableRow>
                        ))}
                        {filteredCanjes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={2} align="center">
                                    No se encontraron canjes
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default HistorialCanjes; 