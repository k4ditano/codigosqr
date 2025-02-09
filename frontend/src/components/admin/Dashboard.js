import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    CircularProgress,
    Alert,
    Button
} from '@mui/material';
import {
    People as PeopleIcon,
    LocalOffer as LocalOfferIcon,
    Assignment as AssignmentIcon,
    Business as BusinessIcon,
    Person as PersonIcon,
    Assessment as AssessmentIcon,
    Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../config/axios';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const actionButtons = [
        {
            title: 'Gestionar Negocios',
            icon: <BusinessIcon />,
            color: '#1976d2',
            onClick: () => navigate('/admin/negocios')
        },
        {
            title: 'Gestionar Usuarios',
            icon: <PersonIcon />,
            color: '#2e7d32',
            onClick: () => navigate('/admin/usuarios')
        },
        {
            title: 'Ver Reportes',
            icon: <AssessmentIcon />,
            color: '#ed6c02',
            onClick: () => navigate('/admin/reportes')
        },
        {
            title: 'Configuración',
            icon: <SettingsIcon />,
            color: '#9c27b0',
            onClick: () => navigate('/admin/configuracion')
        }
    ];

    const statCards = [
        {
            title: 'Negocios Registrados',
            value: stats?.negocios || 0,
            icon: <PeopleIcon sx={{ fontSize: 40 }} />,
            color: '#1976d2'
        },
        {
            title: 'Códigos Generados',
            value: stats?.codigos || 0,
            icon: <LocalOfferIcon sx={{ fontSize: 40 }} />,
            color: '#2e7d32'
        },
        {
            title: 'Formularios Recibidos',
            value: stats?.formularios || 0,
            icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
            color: '#ed6c02'
        }
    ];

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError('');
            const [negocios, codigos, formularios] = await Promise.all([
                axiosClient.get('/negocios/count'),
                axiosClient.get('/codigos/count'),
                axiosClient.get('/formularios/count')
            ]);

            setStats({
                negocios: negocios.data.count || 0,
                codigos: codigos.data.count || 0,
                formularios: formularios.data.count || 0
            });
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
            let mensajeError = 'Error de conexión con el servidor';
            
            if (error.response) {
                switch (error.response.status) {
                    case 401:
                        mensajeError = 'No tiene autorización para ver estas estadísticas';
                        break;
                    case 404:
                        mensajeError = 'No se encontraron los datos solicitados';
                        break;
                    case 500:
                        mensajeError = 'Error interno del servidor';
                        break;
                    default:
                        mensajeError = `Error al cargar las estadísticas: ${error.response.data.message || 'Error desconocido'}`;
                }
            }
            
            setError(mensajeError);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ mt: 2 }}>
                <Alert 
                    severity="error" 
                    action={
                        <Button 
                            color="inherit" 
                            size="small" 
                            onClick={fetchStats}
                        >
                            Reintentar
                        </Button>
                    }
                >
                    {error}
                </Alert>
                
                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                    Acciones Rápidas
                </Typography>
                <Grid container spacing={2}>
                    {actionButtons.map((button, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Paper
                                sx={{
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                    }
                                }}
                                onClick={button.onClick}
                            >
                                <Button
                                    variant="contained"
                                    startIcon={button.icon}
                                    sx={{
                                        backgroundColor: button.color,
                                        '&:hover': {
                                            backgroundColor: button.color,
                                            opacity: 0.9
                                        },
                                        width: '100%'
                                    }}
                                >
                                    {button.title}
                                </Button>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Dashboard
            </Typography>

            <Grid container spacing={3} sx={{ mb: 6 }}>
                {statCards.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Paper
                            sx={{
                                p: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                height: '100%'
                            }}
                        >
                            <Box sx={{ color: stat.color, mb: 2 }}>
                                {stat.icon}
                            </Box>
                            <Typography variant="h4" component="div" gutterBottom>
                                {stat.value}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                {stat.title}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    Acciones Rápidas
                </Typography>
                <Grid container spacing={3}>
                    {actionButtons.map((button, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Paper
                                sx={{
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                    }
                                }}
                                onClick={button.onClick}
                            >
                                <Button
                                    variant="contained"
                                    startIcon={button.icon}
                                    sx={{
                                        backgroundColor: button.color,
                                        '&:hover': {
                                            backgroundColor: button.color,
                                            opacity: 0.9
                                        },
                                        width: '100%'
                                    }}
                                >
                                    {button.title}
                                </Button>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
};

export default Dashboard; 