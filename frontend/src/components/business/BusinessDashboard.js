import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    useTheme,
    useMediaQuery
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const BusinessDashboard = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const menuItems = [
        {
            title: 'Validar Código',
            description: 'Validar códigos de descuento',
            icon: <QrCodeScannerIcon sx={{ fontSize: { xs: 40, sm: 48, md: 56 } }} />,
            route: '/business/validar'
        },
        {
            title: 'Historial de Canjes',
            description: 'Ver historial de códigos canjeados',
            icon: <FormatListBulletedIcon sx={{ fontSize: { xs: 40, sm: 48, md: 56 } }} />,
            route: '/business/historial'
        },
        {
            title: 'Mi Código QR',
            description: 'Ver y descargar mi código QR',
            icon: <QrCode2Icon sx={{ fontSize: { xs: 40, sm: 48, md: 56 } }} />,
            route: '/business/mi-qr'
        },
        {
            title: 'Facturación',
            description: 'Ver estado de pagos y facturación',
            icon: <AccountBalanceWalletIcon sx={{ fontSize: { xs: 40, sm: 48, md: 56 } }} />,
            route: '/business/facturacion'
        }
    ];

    return (
        <Box
            className="responsive-container"
            sx={{
                p: { xs: 2, sm: 3, md: 4 },
                maxWidth: '1200px',
                margin: '0 auto'
            }}
        >
            <Typography
                variant="h4"
                gutterBottom
                sx={{
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                    mb: { xs: 2, sm: 3, md: 4 },
                    textAlign: { xs: 'center', sm: 'left' }
                }}
            >
                Panel de Negocio
            </Typography>

            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
                {menuItems.map((item, index) => (
                    <Grid item xs={12} sm={6} lg={3} key={index}>
                        <Card
                            className="responsive-card"
                            onClick={() => navigate(item.route)}
                            sx={{
                                height: '100%',
                                minHeight: { xs: '120px', sm: '150px' },
                                display: 'flex',
                                cursor: 'pointer'
                            }}
                        >
                            <CardContent sx={{
                                width: '100%',
                                p: { xs: 2, sm: 3 },
                                display: 'flex',
                                flexDirection: { xs: 'row', sm: 'column' },
                                alignItems: 'center',
                                justifyContent: { xs: 'flex-start', sm: 'center' },
                                gap: { xs: 2, sm: 3 }
                            }}>
                                <Box sx={{
                                    color: 'primary.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {item.icon}
                                </Box>
                                <Box sx={{ textAlign: { xs: 'left', sm: 'center' } }}>
                                    <Typography
                                        variant="h6"
                                        component="div"
                                        sx={{
                                            fontSize: { xs: '1rem', sm: '1.25rem' },
                                            fontWeight: 'bold',
                                            mb: { xs: 0.5, sm: 1 }
                                        }}
                                    >
                                        {item.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            fontSize: { xs: '0.875rem', sm: '1rem' },
                                            display: { xs: 'none', sm: 'block' }
                                        }}
                                    >
                                        {item.description}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default BusinessDashboard;
