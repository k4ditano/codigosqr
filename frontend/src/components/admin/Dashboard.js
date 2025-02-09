import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    People as PeopleIcon,
    LocalOffer as LocalOfferIcon,
    Assignment as AssignmentIcon
} from '@mui/icons-material';
import axiosClient from '../../config/axios';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
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
                setLoading(false);
            } catch (error) {
                console.error('Error al cargar estadísticas:', error);
                setError('Error al cargar las estadísticas del dashboard');
                setLoading(false);
            }
        };

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
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

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

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Dashboard
            </Typography>

            <Grid container spacing={3}>
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
        </Box>
    );
};

export default Dashboard; 