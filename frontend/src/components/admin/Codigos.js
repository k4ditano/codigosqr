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
    InputAdornment,
    Container,
    CircularProgress,
    Tooltip,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import QrCodeIcon from '@mui/icons-material/QrCode';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import clienteAxios from '../../config/axios';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import DownloadIcon from '@mui/icons-material/Download';

const Codigos = () => {
    const [codigos, setCodigos] = useState([]);
    const [filteredCodigos, setFilteredCodigos] = useState([]);
    const [negocios, setNegocios] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openQRDialog, setOpenQRDialog] = useState(false);
    const [selectedQR, setSelectedQR] = useState('');
    const [error, setError] = useState(null);

    // Estados para filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedNegocio, setSelectedNegocio] = useState('');
    const [selectedEstado, setSelectedEstado] = useState('');
    const [fechaDesde, setFechaDesde] = useState(null);
    const [fechaHasta, setFechaHasta] = useState(null);

    const [formData, setFormData] = useState({
        email: '',
        negocio_id: '',
        fecha_expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    const [loading, setLoading] = useState(false);
    const [loadingNegocios, setLoadingNegocios] = useState(false);
    const [creatingCode, setCreatingCode] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const filterCodigos = useCallback(() => {
        let filtered = [...codigos];

        // Filtrar por término de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(codigo =>
                codigo.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                codigo.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtrar por negocio
        if (selectedNegocio) {
            filtered = filtered.filter(codigo =>
                codigo.negocio_id === parseInt(selectedNegocio)
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
                new Date(codigo.fecha_creacion || codigo.created_at) >= fechaDesde
            );
        }
        if (fechaHasta) {
            filtered = filtered.filter(codigo =>
                new Date(codigo.fecha_creacion || codigo.created_at) <= fechaHasta
            );
        }

        setFilteredCodigos(filtered);
    }, [codigos, searchTerm, selectedNegocio, selectedEstado, fechaDesde, fechaHasta]);

    useEffect(() => {
        filterCodigos();
    }, [filterCodigos]);

    useEffect(() => {
        obtenerCodigos();
        cargarNegocios();
    }, []);

    const obtenerCodigos = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await clienteAxios.get('/codigos');
            setCodigos(response.data);
            setFilteredCodigos(response.data);
        } catch (error) {
            console.error('Error al obtener códigos:', error);
            setError('Error al cargar los códigos: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const cargarNegocios = async () => {
        setLoadingNegocios(true);
        try {
            const response = await clienteAxios.get('/negocios');
            setNegocios(response.data);
        } catch (error) {
            setError('Error al cargar los negocios: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoadingNegocios(false);
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
        if (!formData.email || !formData.fecha_expiracion) {
            setError('Por favor complete todos los campos requeridos');
            return;
        }

        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setError('Por favor ingrese un email válido');
            return;
        }

        setCreatingCode(true);
        setError(null);
        try {
            const dataToSend = {
                ...formData,
                negocio_id: formData.negocio_id ? parseInt(formData.negocio_id) : null,
                email: formData.email.trim()
            };

            const response = await clienteAxios.post('/codigos', dataToSend);
            setOpenDialog(false);
            await obtenerCodigos();
            setFormData({
                email: '',
                negocio_id: '',
                fecha_expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });
        } catch (error) {
            console.error('Error al crear código:', error);
            setError('Error al crear el código: ' + (error.response?.data?.error || error.message));
        } finally {
            setCreatingCode(false);
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

    const handleCloseDialog = () => {
        if (formData.email || formData.negocio_id || formData.fecha_expiracion) {
            if (window.confirm('¿Está seguro de que desea cerrar? Se perderán los cambios no guardados.')) {
                setOpenDialog(false);
                setFormData({
                    email: '',
                    negocio_id: '',
                    fecha_expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                });
            }
        } else {
            setOpenDialog(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Sin fecha';

        // Convertir el formato DD/MM/YYYY HH24:MI a formato ISO
        if (dateString.includes('/')) {
            const [date, time] = dateString.split(' ');
            const [day, month, year] = date.split('/');
            dateString = `${year}-${month}-${day}T${time}:00`;
        }

        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            console.error('Fecha inválida:', dateString);
            return 'Fecha inválida';
        }

        try {
            return date.toLocaleString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return 'Error en formato';
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} locale={es}>
            <Container maxWidth="lg">
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Gestión de Códigos
                    </Typography>

                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'stretch', sm: 'center' },
                        mb: 3,
                        gap: 2
                    }}>
                        <Typography
                            variant="h5"
                            sx={{
                                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                                textAlign: { xs: 'center', sm: 'left' }
                            }}
                        >
                            Gestión de Códigos
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => setOpenDialog(true)}
                            fullWidth={isMobile}
                            sx={{
                                minWidth: { xs: '100%', sm: 'auto' }
                            }}
                        >
                            Nuevo Código
                        </Button>
                    </Box>

                    {/* Sección de filtros */}
                    <Paper sx={{ p: { xs: 1, sm: 2 }, mb: 3 }} className="responsive-table-container">
                        <Typography variant="h6" gutterBottom sx={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}>
                            <FilterListIcon sx={{ mr: 1 }} />
                            Filtros
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    label="Buscar"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    size={isMobile ? "small" : "medium"}
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
                                    size={isMobile ? "small" : "medium"}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    {negocios.map((negocio) => (
                                        <MenuItem key={negocio.id} value={negocio.id}>
                                            {negocio.nombre}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Estado"
                                    value={selectedEstado}
                                    onChange={(e) => setSelectedEstado(e.target.value)}
                                    size={isMobile ? "small" : "medium"}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    <MenuItem value="true">Activo</MenuItem>
                                    <MenuItem value="false">Canjeado</MenuItem>
                                </TextField>
                            </Grid>
                            {!isMobile && (
                                <>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <DateTimePicker
                                            label="Desde"
                                            value={fechaDesde}
                                            onChange={setFechaDesde}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    size: isMobile ? "small" : "medium"
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <DateTimePicker
                                            label="Hasta"
                                            value={fechaHasta}
                                            onChange={setFechaHasta}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    size: isMobile ? "small" : "medium"
                                                }
                                            }}
                                        />
                                    </Grid>
                                </>
                            )}
                            <Grid item xs={12}>
                                <Button
                                    onClick={resetFilters}
                                    variant="outlined"
                                    fullWidth={isMobile}
                                    size={isMobile ? "small" : "medium"}
                                >
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

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : filteredCodigos.length === 0 ? (
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No se encontraron códigos
                            </Typography>
                            <Typography color="text.secondary">
                                {searchTerm || selectedNegocio || selectedEstado || fechaDesde || fechaHasta
                                    ? 'Prueba a cambiar los filtros de búsqueda'
                                    : 'Crea un nuevo código usando el botón "Nuevo Código"'}
                            </Typography>
                        </Paper>
                    ) : (
                        <TableContainer component={Paper} className="responsive-table-container">
                            <Table size={isMobile ? "small" : "medium"}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Código</TableCell>
                                        {!isMobile && <TableCell>Email</TableCell>}
                                        <TableCell>Negocio</TableCell>
                                        {!isTablet && <TableCell>Fecha Fin</TableCell>}
                                        <TableCell>Estado</TableCell>
                                        {!isMobile && <TableCell>Creación</TableCell>}
                                        <TableCell>Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredCodigos.map((codigo) => (
                                        <TableRow key={codigo.id}>
                                            <TableCell>{codigo.codigo}</TableCell>
                                            {!isMobile && <TableCell>{codigo.email}</TableCell>}
                                            <TableCell>{codigo.negocio_nombre}</TableCell>
                                            {!isTablet && <TableCell>{formatDate(codigo.fecha_fin)}</TableCell>}
                                            <TableCell>
                                                <Chip
                                                    label={codigo.estado ? "Activo" : "Usado"}
                                                    color={codigo.estado ? "success" : "default"}
                                                    size={isMobile ? "small" : "medium"}
                                                />
                                            </TableCell>
                                            {!isMobile && <TableCell>{formatDate(codigo.fecha_creacion)}</TableCell>}
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Tooltip title="Ver QR">
                                                        <IconButton
                                                            onClick={() => handleShowQR(codigo.codigo_qr)}
                                                            color="primary"
                                                            size={isMobile ? "small" : "medium"}
                                                        >
                                                            <QrCodeIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Ver Canjes">
                                                        <IconButton
                                                            color="secondary"
                                                            onClick={() => window.location.href = `/admin/codigos/${codigo.id}/canjes`}
                                                            size={isMobile ? "small" : "medium"}
                                                        >
                                                            <VisibilityIcon />
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

                    {/* Dialog para crear nuevo código */}
                    <Dialog
                        open={openDialog}
                        onClose={handleCloseDialog}
                        fullScreen={isMobile}
                        maxWidth="sm"
                        fullWidth
                    >
                        <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                            Nuevo Código de Descuento
                        </DialogTitle>
                        <DialogContent>
                            <Box component="form" sx={{ mt: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Email del Cliente"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    margin="normal"
                                    required
                                    size={isMobile ? "small" : "medium"}
                                />
                                <TextField
                                    fullWidth
                                    select
                                    label="Negocio"
                                    name="negocio_id"
                                    value={formData.negocio_id}
                                    onChange={handleChange}
                                    margin="normal"
                                    size={isMobile ? "small" : "medium"}
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
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            margin: "normal",
                                            size: isMobile ? "small" : "medium"
                                        }
                                    }}
                                />
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
                            <Button onClick={handleCloseDialog} size={isMobile ? "small" : "medium"}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                variant="contained"
                                size={isMobile ? "small" : "medium"}
                                disabled={creatingCode}
                            >
                                {creatingCode ? 'Creando...' : 'Crear'}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Dialog para mostrar QR */}
                    <Dialog
                        open={openQRDialog}
                        onClose={() => setOpenQRDialog(false)}
                        maxWidth="xs"
                        fullWidth
                    >
                        <DialogTitle sx={{ textAlign: 'center' }}>
                            Código QR
                        </DialogTitle>
                        <DialogContent sx={{ textAlign: 'center' }}>
                            {selectedQR && (
                                <Box
                                    component="img"
                                    src={selectedQR}
                                    alt="QR Code"
                                    sx={{
                                        width: '100%',
                                        maxWidth: '250px',
                                        height: 'auto'
                                    }}
                                />
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = selectedQR;
                                    link.download = 'codigo-qr.png';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }}
                                startIcon={<DownloadIcon />}
                            >
                                Descargar
                            </Button>
                            <Button onClick={() => setOpenQRDialog(false)}>
                                Cerrar
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Container>
        </LocalizationProvider>
    );
};

export default Codigos;
