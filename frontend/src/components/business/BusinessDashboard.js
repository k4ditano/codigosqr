import React from 'react';
import { Grid, Card, CardContent, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const BusinessDashboard = () => {
    const navigate = useNavigate();

    const menuItems = [
        {
            title: 'Validar Código',
            description: 'Validar códigos de descuento',
            icon: <QrCodeScannerIcon sx={{ fontSize: 40 }}/>,
            route: '/business/validar'
        },
        {
            title: 'Historial de Canjes',
            description: 'Ver historial de códigos canjeados',
            icon: <FormatListBulletedIcon sx={{ fontSize: 40 }}/>,
            route: '/business/historial'
        },
        {
            title: 'Mi Código QR',
            description: 'Ver y descargar mi código QR',
            icon: <QrCode2Icon sx={{ fontSize: 40 }}/>,
            route: '/business/mi-qr'
        },
        {
            title: 'Facturación',
            description: 'Ver estado de pagos y facturación',
            icon: <AccountBalanceWalletIcon sx={{ fontSize: 40 }}/>,
            route: '/business/facturacion'
        }
    ];

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Panel de Negocio
            </Typography>
            <Grid container spacing={3}>
                {menuItems.map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                {item.icon}
                                <Typography variant="h6" component="div" sx={{ mt: 2 }}>
                                    {item.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {item.description}
                                </Typography>
                                <Button 
                                    variant="contained" 
                                    onClick={() => navigate(item.route)}
                                    fullWidth
                                >
                                    Acceder
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default BusinessDashboard; 