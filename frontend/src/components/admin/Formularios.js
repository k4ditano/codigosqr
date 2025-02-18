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
    Button,
    Container,
    useTheme,
    useMediaQuery,
    Chip
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
    const [loading, setLoading] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const handleMarcarAtendido = async (id) => {
        try {
            setLoading(true);
            await axiosClient.put(`/formularios/${id}/atender`);
            setSuccess('Formulario marcado como atendido');
            cargarFormularios();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError('Error al marcar el formulario como atendido');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerarCodigo = async (formulario) => {
        try {
            setLoading(true);
            setError('');
            await axiosClient.post('/codigos', {
                email: formulario.email,
                negocio_id: formulario.negocio_id,
                porcentaje: 10,
                fecha_expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            await axiosClient.put(`/formularios/${formulario.id}/atender`);

            setSuccess('Código de descuento generado y enviado exitosamente');
            cargarFormularios();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error:', error);
            setError('Error al generar el código de descuento');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const filterFormularios = useCallback(() => {
        const filtered = formularios.filter(form =>
            form.id.toString().includes(searchTerm) ||
            form.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            form.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            form.telefono.includes(searchTerm) ||
            (form.negocio_nombre && form.negocio_nombre.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredFormularios(filtered);
    }, [formularios, searchTerm]);

    const cargarFormularios = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/formularios');
            setFormularios(response.data);
            setFilteredFormularios(response.data);
        } catch (error) {
            setError('Error al cargar los formularios');
        } finally {
            setLoading(false);
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
        <Container maxWidth="lg">
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                        fontSize: { xs: '1.25rem', sm: '1.5rem' },
                        mb: { xs: 2, sm: 3 }
                    }}
                >
                    Formularios Pendientes
                </Typography>

                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        placeholder="Buscar por ID, nombre, email, teléfono o negocio..."
                        variant="outlined"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size={isMobile ? "small" : "medium"}
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

                {success && (
                    <Alert
                        severity="success"
                        sx={{
                            mb: 2,
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                    >
                        {success}
                    </Alert>
                )}

                <TableContainer component={Paper} className="responsive-table-container">
                    <Table size={isMobile ? "small" : "medium"}>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Nombre</TableCell>
                                {!isMobile && <TableCell>Email</TableCell>}
                                {!isTablet && <TableCell>Teléfono</TableCell>}
                                <TableCell>Negocio</TableCell>
                                {!isMobile && <TableCell>Fecha</TableCell>}
                                <TableCell>Estado</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredFormularios.map((form) => (
                                <TableRow key={form.id}>
                                    <TableCell>{form.id}</TableCell>
                                    <TableCell>{form.nombre}</TableCell>
                                    {!isMobile && <TableCell>{form.email}</TableCell>}
                                    {!isTablet && <TableCell>{form.telefono}</TableCell>}
                                    <TableCell>{form.negocio_nombre || 'N/A'}</TableCell>
                                    {!isMobile && <TableCell>{form.fecha_formateada}</TableCell>}
                                    <TableCell>
                                        {form.atendido ? (
                                            <Chip
                                                label="Atendido"
                                                color="success"
                                                size={isMobile ? "small" : "medium"}
                                            />
                                        ) : (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                startIcon={<LocalOfferIcon />}
                                                onClick={() => handleGenerarCodigo(form)}
                                                disabled={loading}
                                                size={isMobile ? "small" : "medium"}
                                                sx={{
                                                    whiteSpace: 'nowrap',
                                                    minWidth: { xs: '100%', sm: 'auto' }
                                                }}
                                            >
                                                {isMobile ? "Generar" : "Generar Código"}
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredFormularios.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={isMobile ? 4 : (isTablet ? 5 : 7)}
                                        align="center"
                                        sx={{
                                            py: 4,
                                            fontSize: { xs: '0.875rem', sm: '1rem' }
                                        }}
                                    >
                                        No se encontraron formularios
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Container>
    );
};

export default Formularios;
