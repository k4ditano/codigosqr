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
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Switch,
    Alert,
    Chip,
    Grid,
    MenuItem,
    InputAdornment,
    Snackbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import QrCodeIcon from '@mui/icons-material/QrCode';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { DateTimePicker } from '@mui/x-date-pickers';
import axiosClient from '../../config/axios';
import DeleteIcon from '@mui/icons-material/Delete';

const Negocios = () => {
    const [negocios, setNegocios] = useState([]);
    const [filteredNegocios, setFilteredNegocios] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedNegocio, setSelectedNegocio] = useState(null);
    const initialFormState = {
        nombre: '',
        email: '',
        email_asociado: '',
        telefono: '',
        estado: true
    };

    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        email_asociado: '',
        telefono: '',
        estado: true
    });
    const [error, setError] = useState('');
    const [qrDialog, setQrDialog] = useState(false);
    const [selectedQR, setSelectedQR] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEstado, setSelectedEstado] = useState('');
    const [fechaDesde, setFechaDesde] = useState(null);
    const [fechaHasta, setFechaHasta] = useState(null);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [confirmDialog, setConfirmDialog] = useState({ open: false, negocioId: null });

    const cargarNegocios = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/negocios');
            setNegocios(response.data);
            setFilteredNegocios(response.data);
        } catch (error) {
            console.error('Error al cargar los negocios');
        } finally {
            setLoading(false);
        }
    }, []);

    const filterNegocios = useCallback(() => {
        let filtered = [...negocios];

        if (searchTerm) {
            filtered = filtered.filter(negocio =>
                negocio.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                negocio.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                negocio.telefono?.includes(searchTerm)
            );
        }

        if (selectedEstado !== '') {
            filtered = filtered.filter(negocio =>
                negocio.estado === (selectedEstado === 'true')
            );
        }

        if (fechaDesde) {
            filtered = filtered.filter(negocio =>
                new Date(negocio.created_at) >= fechaDesde
            );
        }
        if (fechaHasta) {
            filtered = filtered.filter(negocio =>
                new Date(negocio.created_at) <= fechaHasta
            );
        }

        setFilteredNegocios(filtered);
    }, [negocios, searchTerm, selectedEstado, fechaDesde, fechaHasta]);

    useEffect(() => {
        cargarNegocios();
    }, [cargarNegocios]);

    useEffect(() => {
        filterNegocios();
    }, [filterNegocios]);

    useEffect(() => {
        if (selectedNegocio) {
            setFormData({
                nombre: selectedNegocio.nombre || '',
                email: selectedNegocio.email || '',
                email_asociado: selectedNegocio.email_asociado || '',
                telefono: selectedNegocio.telefono || '',
                estado: selectedNegocio.estado
            });
        } else {
            setFormData(initialFormState);
        }
    }, [selectedNegocio]);

    const resetForm = () => {
        setFormData({
            nombre: '',
            email: '',
            email_asociado: '',
            telefono: '',
            estado: true
        });
    };

    const handleClose = () => {
        setOpenDialog(false);
        setFormData(initialFormState);
        setError('');
    };

    const handleOpenDialog = (negocio = null) => {
        setSelectedNegocio(negocio);
        if (negocio) {
            // Al editar, mantener los valores originales
            setFormData({
                nombre: negocio.nombre || '',
                email: negocio.email || '',
                email_asociado: negocio.email_asociado || '',  // Ya no usamos el email principal como fallback
                telefono: negocio.telefono || '',
                estado: negocio.estado
            });
        } else {
            // Para nuevo negocio, todos los campos empiezan vacíos
            setFormData({
                nombre: '',
                email: '',
                email_asociado: '',
                telefono: '',
                estado: true
            });
        }
        setOpenDialog(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.nombre || !formData.email) {
            setError('Los campos nombre y email son obligatorios');
            return;
        }

        try {
            // Construir el objeto de datos asegurando que email_asociado sea independiente
            const dataToSend = {
                nombre: formData.nombre.trim(),
                email: formData.email.trim(),
                telefono: formData.telefono ? formData.telefono.trim() : '',
                // Solo incluir email_asociado si tiene un valor
                email_asociado: formData.email.trim()
            };

            console.log('Datos a enviar:', dataToSend); // Debug log

            if (selectedNegocio) {
                await axiosClient.put(`/negocios/${selectedNegocio.id}`, {
                    ...dataToSend,
                    estado: formData.estado
                });
            } else {
                await axiosClient.post('/negocios', dataToSend);
            }

            await cargarNegocios();
            handleClose();
            setSnackbar({
                open: true,
                message: `Negocio ${selectedNegocio ? 'actualizado' : 'creado'} exitosamente`,
                severity: 'success'
            });
        } catch (error) {
            console.error('Error:', error);
            setError(error.response?.data?.error || `Error al ${selectedNegocio ? 'actualizar' : 'crear'} el negocio`);
        }
    };

    const handleChange = (e) => {
        const { name, value, checked } = e.target;

        if (name === 'estado') {
            setFormData(prev => ({
                ...prev,
                estado: checked
            }));
            return;
        }


        // Para otros campos
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEmailAsociadoChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            email_asociado: value,
            // Asegurarnos de que sea independiente del email principal
            ...(value === prev.email ? { email_asociado: '' } : {})
        }));
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            email: value,
            // No modificar email_asociado cuando cambia el email principal
            email_asociado: prev.email_asociado
        }));
    };

    const handleQRClick = async (id) => {
        try {
            const response = await axiosClient.get(`/negocios/${id}`);
            setSelectedQR(response.data.codigo_qr);
            setQrDialog(true);
        } catch (error) {
            setError('Error al cargar el código QR');
        }
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedEstado('');
        setFechaDesde(null);
        setFechaHasta(null);
    };

    const eliminarNegocio = async (id) => {
        try {
            await axiosClient.delete(`/negocios/${id}`);
            setSnackbar({
                open: true,
                message: 'Negocio eliminado exitosamente',
                severity: 'success'
            });
            cargarNegocios();
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Error al eliminar el negocio',
                severity: 'error'
            });
            console.error(error);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Gestión de Negocios</Typography>
                <Button
                    variant="contained"
                    onClick={() => handleOpenDialog()}
                >
                    Nuevo Negocio
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
                            label="Estado"
                            value={selectedEstado}
                            onChange={(e) => setSelectedEstado(e.target.value)}
                        >
                            <MenuItem value="">Todos</MenuItem>
                            <MenuItem value="true">Activo</MenuItem>
                            <MenuItem value="false">Inactivo</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <DateTimePicker
                            label="Desde"
                            value={fechaDesde}
                            onChange={setFechaDesde}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
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
                            <TableCell>Nombre</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Email Notificaciones</TableCell>
                            <TableCell>Teléfono</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredNegocios.map((negocio) => (
                            <TableRow key={negocio.id}>
                                <TableCell>{negocio.nombre}</TableCell>
                                <TableCell>{negocio.email}</TableCell>
                                <TableCell>{negocio.email_asociado === negocio.email ? '' : negocio.email_asociado}</TableCell>
                                <TableCell>{negocio.telefono}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={negocio.estado ? "Activo" : "Inactivo"}
                                        color={negocio.estado ? "success" : "error"}
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={() => handleQRClick(negocio.id)}
                                        color="primary"
                                    >
                                        <QrCodeIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleOpenDialog(negocio)}
                                        color="primary"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => setConfirmDialog({ open: true, negocioId: negocio.id })}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={openDialog}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                TransitionProps={{
                    onEntered: () => {
                        // Asegurarnos de que los campos estén correctamente inicializados
                        if (!selectedNegocio) {
                            setFormData(prev => ({
                                ...prev,
                                email_asociado: ''
                            }));
                        }
                    }
                }}
            >
                <DialogTitle>
                    {selectedNegocio ? 'Editar Negocio' : 'Nuevo Negocio'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 2 }} onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Nombre del Negocio"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Email Principal"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleEmailChange}
                            margin="normal"
                            required
                            helperText="Email principal para inicio de sesión"
                        />
                        <TextField
                            fullWidth
                            label="Email para Notificaciones"
                            name="email_asociado"
                            type="email"
                            value={formData.email_asociado}
                            onChange={handleEmailAsociadoChange}
                            margin="normal"
                            helperText="Email donde se recibirán las notificaciones (opcional)"
                        />
                        <TextField
                            fullWidth
                            label="Teléfono"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            margin="normal"
                        />
                        {selectedNegocio && (
                            <Box sx={{ mt: 2 }}>
                                <Typography component="label">
                                    Estado
                                    <Switch
                                        name="estado"
                                        checked={formData.estado}
                                        onChange={handleChange}
                                    />
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {selectedNegocio ? 'Actualizar' : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={qrDialog}
                onClose={() => setQrDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Código QR del Negocio</DialogTitle>
                <DialogContent>
                    {selectedQR && (
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                            <img
                                src={selectedQR}
                                alt="QR Code"
                                style={{ maxWidth: '100%', width: '300px' }}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setQrDialog(false)}>Cerrar</Button>
                    {selectedQR && (
                        <Button
                            onClick={() => {
                                const link = document.createElement('a');
                                link.href = selectedQR;
                                link.download = 'qr-code.png';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                            color="primary"
                        >
                            Descargar
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Dialog de confirmación para eliminar */}
            <Dialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ open: false, negocioId: null })}
            >
                <DialogTitle>Confirmar eliminación</DialogTitle>
                <DialogContent>
                    ¿Estás seguro de que deseas eliminar este negocio?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog({ open: false, negocioId: null })}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={() => {
                            eliminarNegocio(confirmDialog.negocioId);
                            setConfirmDialog({ open: false, negocioId: null });
                        }}
                        color="error"
                        variant="contained"
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar para mensajes */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Negocios;
