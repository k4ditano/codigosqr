import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Alert,
    IconButton,
    Grid,
    Chip,
    InputAdornment
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import QrCodeIcon from '@mui/icons-material/QrCode';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import axiosClient from '../../config/axios';

const Codigos = () => {
    const [codigos, setCodigos] = useState([]);
    const [filteredCodigos, setFilteredCodigos] = useState([]);
    const [negocios, setNegocios] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openQRDialog, setOpenQRDialog] = useState(false);
    const [selectedQR, setSelectedQR] = useState('');
    const [error, setError] = useState('');
    
    // Estados para filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedNegocio, setSelectedNegocio] = useState('');
    const [selectedEstado, setSelectedEstado] = useState('');
    const [fechaDesde, setFechaDesde] = useState(null);
    const [fechaHasta, setFechaHasta] = useState(null);

    const [formData, setFormData] = useState({
        cliente_email: '',
        negocio_id: '',
        fecha_expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        enviar_email: true  // Nueva opción para enviar email o no
    });

    const filterCodigos = useCallback(() => {
        let filtered = [...codigos];

        // Filtrar por término de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(codigo => 
                codigo.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                codigo.cliente_email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtrar por negocio
        if (selectedNegocio) {
            filtered = filtered.filter(codigo => 
                codigo.negocio_id === selectedNegocio
            );
        }

        // Filtrar por estado
        if (selectedEstado !== '') {
            filtered = filtered.filter(codigo => 
                codigo.estado === (selectedEstado === 'true')
            );
        }

        // Filtrar por fecha de creación
        if (fechaDesde) {
            filtered = filtered.filter(codigo => 
                new Date(codigo.fecha_creacion) >= fechaDesde
            );
        }
        if (fechaHasta) {
            filtered = filtered.filter(codigo => 
                new Date(codigo.fecha_creacion) <= fechaHasta
            );
        }

        setFilteredCodigos(filtered);
    }, [codigos, searchTerm, selectedNegocio, selectedEstado, fechaDesde, fechaHasta]);

    useEffect(() => {
        filterCodigos();
    }, [filterCodigos]);

    useEffect(() => {
        cargarCodigos();
        cargarNegocios();
    }, []);

    const cargarCodigos = async () => {
        try {
            const response = await axiosClient.get('/codigos');
            setCodigos(response.data);
            setFilteredCodigos(response.data);
        } catch (error) {
            setError('Error al cargar los códigos');
        }
    };

    const cargarNegocios = async () => {
        try {
            const response = await axiosClient.get('/negocios');
            setNegocios(response.data);
        } catch (error) {
            setError('Error al cargar los negocios');
        }
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedNegocio('');
        setSelectedEstado('');
        setFechaDesde(null);
        setFechaHasta(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Limpiar errores previos
        try {
            console.log('Enviando datos:', formData);
            const response = await axiosClient.post('/codigos', formData);
            console.log('Respuesta exitosa:', response.data);
            setOpenDialog(false);
            cargarCodigos();
            setFormData({
                cliente_email: '',
                negocio_id: '',
                fecha_expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                enviar_email: true
            });
        } catch (error) {
            console.error('Error al crear código:', error);
            let errorMessage = 'Error al crear el código';
            
            // Mostrar mensaje de error detallado del servidor si está disponible
            if (error.response?.data?.details) {
                if (error.response.data.details.includes('emailService.enviarCodigoDescuento is not a function')) {
                    errorMessage = 'Error en el servicio de correo. El código no pudo ser enviado por email.';
                } else {
                    errorMessage += `: ${error.response.data.details}`;
                }
            } else if (error.response?.data?.message) {
                errorMessage += `: ${error.response.data.message}`;
            } else if (error.response?.data?.error) {
                errorMessage += `: ${error.response.data.error}`;
            }
            
            setError(errorMessage);
        }
    };

    const handleShowQR = (qrCode) => {
        setSelectedQR(qrCode);
        setOpenQRDialog(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Códigos de Descuento</Typography>
                <Button 
                    variant="contained" 
                    onClick={() => setOpenDialog(true)}
                >
                    Nuevo Código
                </Button>
            </Box>

            {/* Sección de filtros */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Filtros
                </Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Buscar"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            select
                            label="Negocio"
                            value={selectedNegocio}
                            onChange={(e) => setSelectedNegocio(e.target.value)}
                        >
                            <MenuItem value="">Todos</MenuItem>
                            {negocios.map((negocio) => (
                                <MenuItem key={negocio.id} value={negocio.id}>
                                    {negocio.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            fullWidth
                            select
                            label="Estado"
                            value={selectedEstado}
                            onChange={(e) => setSelectedEstado(e.target.value)}
                        >
                            <MenuItem value="">Todos</MenuItem>
                            <MenuItem value="true">Activo</MenuItem>
                            <MenuItem value="false">Canjeado</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <DateTimePicker
                            label="Desde"
                            value={fechaDesde}
                            onChange={setFechaDesde}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <DateTimePicker
                            label="Hasta"
                            value={fechaHasta}
                            onChange={setFechaHasta}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button onClick={resetFilters} variant="outlined">
                            Limpiar Filtros
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

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
                            <TableCell>Email Cliente</TableCell>
                            <TableCell>Negocio</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Fecha Creación</TableCell>
                            <TableCell>Fecha Expiración</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCodigos.map((codigo) => (
                            <TableRow key={codigo.id}>
                                <TableCell>{codigo.codigo}</TableCell>
                                <TableCell>{codigo.cliente_email}</TableCell>
                                <TableCell>{codigo.negocio_nombre || 'Todos'}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={codigo.estado ? "Activo" : "Canjeado"}
                                        color={codigo.estado ? "success" : "default"}
                                    />
                                </TableCell>
                                <TableCell>
                                    {new Date(codigo.fecha_creacion).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    {new Date(codigo.fecha_expiracion).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <IconButton 
                                        onClick={() => handleShowQR(codigo.qr_code)}
                                        color="primary"
                                    >
                                        <QrCodeIcon />
                                    </IconButton>
                                    <IconButton 
                                        color="secondary"
                                        onClick={() => window.location.href = `/admin/codigos/${codigo.id}/canjes`}
                                    >
                                        <VisibilityIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog para crear nuevo código */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Nuevo Código de Descuento</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Email del Cliente"
                            name="cliente_email"
                            type="email"
                            value={formData.cliente_email}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            select
                            label="Negocio"
                            name="negocio_id"
                            value={formData.negocio_id}
                            onChange={handleChange}
                            margin="normal"
                        >
                            <MenuItem value="">Todos los negocios</MenuItem>
                            {negocios.map((negocio) => (
                                <MenuItem key={negocio.id} value={negocio.id}>
                                    {negocio.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                        <DateTimePicker
                            label="Fecha de Expiración"
                            value={formData.fecha_expiracion}
                            onChange={(newValue) => {
                                setFormData(prev => ({
                                    ...prev,
                                    fecha_expiracion: newValue
                                }));
                            }}
                            renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                        />
                        <TextField
                            fullWidth
                            select
                            label="Enviar notificación por email"
                            name="enviar_email"
                            value={formData.enviar_email.toString()}
                            onChange={(e) => {
                                setFormData(prev => ({
                                    ...prev,
                                    enviar_email: e.target.value === 'true'
                                }));
                            }}
                            margin="normal"
                            helperText="Si está experimentando errores con el envío de emails, seleccione 'No'"
                        >
                            <MenuItem value="true">Sí</MenuItem>
                            <MenuItem value="false">No</MenuItem>
                        </TextField>
                        {error && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {error}
                            </Alert>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} variant="contained">
                        Crear
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog para mostrar QR */}
            <Dialog open={openQRDialog} onClose={() => setOpenQRDialog(false)}>
                <DialogTitle>Código QR</DialogTitle>
                <DialogContent>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                        <img src={selectedQR} alt="Código QR" style={{ maxWidth: '100%' }} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenQRDialog(false)}>
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Codigos;