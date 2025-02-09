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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import SearchIcon from '@mui/icons-material/Search';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import axiosClient from '../../config/axios';

const Formularios = () => {
    const [formularios, setFormularios] = useState([]);
    const [filteredFormularios, setFilteredFormularios] = useState([]);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedFormulario, setSelectedFormulario] = useState(null);
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        fecha_expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días por defecto
    });

    const filterFormularios = useCallback(() => {
        const filtered = formularios.filter(form => 
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

    const handleGenerarCodigo = (formulario) => {
        setSelectedFormulario(formulario);
        setOpenDialog(true);
    };

    const handleConfirmarGeneracion = async () => {
        try {
            await axiosClient.post('/codigos', {
                cliente_email: selectedFormulario.email,
                negocio_id: selectedFormulario.negocio_id,
                fecha_expiracion: formData.fecha_expiracion
            });
            setSuccess('Código generado y enviado exitosamente');
            setOpenDialog(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError('Error al generar el código de descuento');
        }
    };

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
        <Box>
            <Typography variant="h5" gutterBottom>
                Formularios Recibidos
            </Typography>

            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Buscar por nombre, email, teléfono o negocio..."
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
                            <TableCell>Nombre</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Teléfono</TableCell>
                            <TableCell>Negocio</TableCell>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredFormularios.map((form) => (
                            <TableRow key={form.id}>
                                <TableCell>{form.nombre}</TableCell>
                                <TableCell>{form.email}</TableCell>
                                <TableCell>{form.telefono}</TableCell>
                                <TableCell>{form.negocio_nombre}</TableCell>
                                <TableCell>{formatDate(form.fecha_envio)}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        startIcon={<LocalOfferIcon />}
                                        onClick={() => handleGenerarCodigo(form)}
                                        size="small"
                                    >
                                        Generar Código
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

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Generar Código de Descuento</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Typography variant="body1" gutterBottom>
                            Se generará un código de descuento para:
                        </Typography>
                        {selectedFormulario && (
                            <>
                                <Typography><strong>Cliente:</strong> {selectedFormulario.nombre}</Typography>
                                <Typography><strong>Email:</strong> {selectedFormulario.email}</Typography>
                                <Typography><strong>Negocio:</strong> {selectedFormulario.negocio_nombre}</Typography>
                            </>
                        )}
                        <Box sx={{ mt: 2 }}>
                            <DateTimePicker
                                label="Fecha de Expiración"
                                value={formData.fecha_expiracion}
                                onChange={(newValue) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        fecha_expiracion: newValue
                                    }));
                                }}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleConfirmarGeneracion} 
                        variant="contained"
                        color="primary"
                    >
                        Generar y Enviar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Formularios; 