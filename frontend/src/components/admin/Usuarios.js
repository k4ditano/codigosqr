import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Switch,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar,
    Alert
} from '@mui/material';
import { Edit as EditIcon, Key as KeyIcon } from '@mui/icons-material';
import clienteAxios from '../../config/axios';
import { formatearFecha } from '../../utils/helpers';

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
    const [editForm, setEditForm] = useState({
        nombre: '',
        email: '',
        email_asociado: '',
        telefono: '',
        role: ''
    });

    const cargarUsuarios = async () => {
        try {
            const response = await clienteAxios.get('/usuarios');
            setUsuarios(response.data);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            mostrarAlerta('Error al cargar la lista de usuarios', 'error');
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const handleEditClick = (usuario) => {
        setSelectedUser(usuario);
        setEditForm({
            nombre: usuario.nombre,
            email: usuario.email,
            email_asociado: usuario.email_asociado || '',
            telefono: usuario.telefono || '',
            role: usuario.role
        });
        setOpenEdit(true);
    };

    const handleEditClose = () => {
        setOpenEdit(false);
        setSelectedUser(null);
        setEditForm({
            nombre: '',
            email: '',
            email_asociado: '',
            telefono: '',
            role: ''
        });
    };

    const handleEditSubmit = async () => {
        try {
            await clienteAxios.put(`/usuarios/${selectedUser.id}`, editForm);
            mostrarAlerta('Usuario actualizado exitosamente', 'success');
            handleEditClose();
            cargarUsuarios();
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            mostrarAlerta('Error al actualizar el usuario', 'error');
        }
    };

    const handleEstadoChange = async (id, nuevoEstado) => {
        try {
            await clienteAxios.patch(`/usuarios/${id}/estado`, { estado: nuevoEstado });
            mostrarAlerta('Estado actualizado exitosamente', 'success');
            cargarUsuarios();
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            mostrarAlerta('Error al cambiar el estado del usuario', 'error');
        }
    };

    const handleResetPassword = async (id) => {
        try {
            await clienteAxios.post(`/usuarios/${id}/resetear-password`);
            mostrarAlerta('Contraseña reseteada exitosamente', 'success');
        } catch (error) {
            console.error('Error al resetear contraseña:', error);
            mostrarAlerta('Error al resetear la contraseña', 'error');
        }
    };

    const mostrarAlerta = (message, severity) => {
        setAlert({ open: true, message, severity });
    };

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Gestión de Usuarios
            </Typography>

            <Card>
                <CardContent>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Email Asociado</TableCell>
                                    <TableCell>Teléfono</TableCell>
                                    <TableCell>Rol</TableCell>
                                    <TableCell>Fecha Registro</TableCell>
                                    <TableCell>Estado</TableCell>
                                    <TableCell>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {usuarios.map((usuario) => (
                                    <TableRow key={usuario.id}>
                                        <TableCell>{usuario.nombre}</TableCell>
                                        <TableCell>{usuario.email}</TableCell>
                                        <TableCell>{usuario.email_asociado || '-'}</TableCell>
                                        <TableCell>{usuario.telefono || '-'}</TableCell>
                                        <TableCell>{usuario.role}</TableCell>
                                        <TableCell>{formatearFecha(usuario.fecha_registro)}</TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={usuario.estado}
                                                onChange={(e) => handleEstadoChange(usuario.id, e.target.checked)}
                                                color="primary"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => handleEditClick(usuario)}
                                                color="primary"
                                                size="small"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleResetPassword(usuario.id)}
                                                color="secondary"
                                                size="small"
                                            >
                                                <KeyIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            <Dialog open={openEdit} onClose={handleEditClose}>
                <DialogTitle>Editar Usuario</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                        <TextField
                            label="Nombre"
                            value={editForm.nombre}
                            onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Email Asociado"
                            value={editForm.email_asociado}
                            onChange={(e) => setEditForm({ ...editForm, email_asociado: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Teléfono"
                            value={editForm.telefono}
                            onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Rol</InputLabel>
                            <Select
                                value={editForm.role}
                                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                label="Rol"
                            >
                                <MenuItem value="admin">Administrador</MenuItem>
                                <MenuItem value="business">Negocio</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditClose}>Cancelar</Button>
                    <Button onClick={handleEditSubmit} variant="contained" color="primary">
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={alert.open}
                autoHideDuration={6000}
                onClose={() => setAlert({ ...alert, open: false })}
            >
                <Alert
                    onClose={() => setAlert({ ...alert, open: false })}
                    severity={alert.severity}
                    sx={{ width: '100%' }}
                >
                    {alert.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Usuarios;
