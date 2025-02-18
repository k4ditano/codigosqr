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
    Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import axiosClient from '../../config/axios';

const Formularios = () => {
    const [formularios, setFormularios] = useState([]);
    const [filteredFormularios, setFilteredFormularios] = useState([]);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [success, setSuccess] = useState('');

    const handleMarcarAtendido = async (id) => {
        try {
            await axiosClient.put(`/formularios/${id}/atender`);
            setSuccess('Formulario marcado como atendido');
            cargarFormularios(); // Recargar la lista
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError('Error al marcar el formulario como atendido');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleGenerarCodigo = async (formulario) => {
        try {
            setError('');
            // Generar código de descuento
            await axiosClient.post('/codigos', {
                email: formulario.email,
                negocio_id: formulario.negocio_id,
                porcentaje: 10, // Porcentaje por defecto
                fecha_expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
            });

            // Marcar el formulario como atendido
            await axiosClient.put(`/formularios/${formulario.id}/atender`);

            setSuccess('Código de descuento generado y enviado exitosamente');
            cargarFormularios(); // Recargar la lista
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error:', error);
            setError('Error al generar el código de descuento');
            setTimeout(() => setError(''), 3000);
        }
    };

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            flex: 0.5,
            minWidth: 70
        },
        {
            field: 'nombre',
            headerName: 'Nombre',
            flex: 1,
            minWidth: 150
        },
        {
            field: 'email',
            headerName: 'Email',
            flex: 1,
            minWidth: 200
        },
        {
            field: 'telefono',
            headerName: 'Teléfono',
            flex: 1,
            minWidth: 120
        },
        {
            field: 'negocio_nombre',
            headerName: 'Negocio',
            flex: 1,
            minWidth: 150,
            valueGetter: (params) => params.row.negocio_nombre || 'N/A'
        },
        {
            field: 'fecha_formateada',
            headerName: 'Fecha',
            flex: 1,
            minWidth: 150
        },
        {
            field: 'acciones',
            headerName: 'Acciones',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<LocalOfferIcon />}
                    onClick={() => handleGenerarCodigo(params.row)}
                    disabled={params.row.atendido}
                >
                    {params.row.atendido ? "Código Generado" : "Generar Código"}
                </Button>
            )
        }
    ];

    const filterFormularios = useCallback(() => {
        const filtered = formularios.filter(form =>
            form.id.toString().includes(searchTerm) ||
            form.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            form.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            form.telefono.includes(searchTerm) ||
            form.negocio_nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredFormularios(filtered);
    }, [formularios, searchTerm]);

    const cargarFormularios = async () => {
        try {
            const response = await axiosClient.get('/formularios');
            setFormularios(response.data);
            setFilteredFormularios(response.data);
        } catch (error) {
            setError('Error al cargar los formularios');
        }
    };

    useEffect(() => {
        cargarFormularios();
    }, []);

    useEffect(() => {
        filterFormularios();
    }, [filterFormularios]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Typography variant="h5" gutterBottom>
                Formularios Pendientes
            </Typography>

            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Buscar por ID, nombre, email, teléfono o negocio..."
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

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell key={column.field}>{column.headerName}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredFormularios
                            .filter(form => !form.atendido)
                            .map((form) => (
                                <TableRow key={form.id}>
                                    <TableCell>{form.id}</TableCell>
                                    <TableCell>{form.nombre}</TableCell>
                                    <TableCell>{form.email}</TableCell>
                                    <TableCell>{form.telefono}</TableCell>
                                    <TableCell>{form.negocio_nombre || 'N/A'}</TableCell>
                                    <TableCell>{form.fecha_formateada}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<LocalOfferIcon />}
                                            onClick={() => handleGenerarCodigo(form)}
                                            disabled={form.atendido}
                                        >
                                            {form.atendido ? "Código Generado" : "Generar Código"}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        {filteredFormularios.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No se encontraron formularios
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Formularios;
