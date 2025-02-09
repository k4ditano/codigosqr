import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard,
    Business,
    LocalOffer,
    Assignment,
    QrCode,
    History,
    CheckCircle,
    Logout
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const [menuOpen, setMenuOpen] = React.useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isAdmin = user?.role === 'admin';

    const adminMenuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
        { text: 'Negocios', icon: <Business />, path: '/admin/negocios' },
        { text: 'Códigos', icon: <LocalOffer />, path: '/admin/codigos' },
        { text: 'Formularios', icon: <Assignment />, path: '/admin/formularios' }
    ];

    const businessMenuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/business' },
        { text: 'Mi QR', icon: <QrCode />, path: '/business/mi-qr' },
        { text: 'Validar Código', icon: <CheckCircle />, path: '/business/validar' },
        { text: 'Historial', icon: <History />, path: '/business/historial' }
    ];

    const menuItems = isAdmin ? adminMenuItems : businessMenuItems;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleMenuClick = (path) => {
        navigate(path);
        setMenuOpen(false);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed">
                <Toolbar>
                    <IconButton
                        color="inherit"
                        onClick={() => setMenuOpen(true)}
                        edge="start"
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Sistema de Descuentos
                    </Typography>
                    <Button color="inherit" onClick={handleLogout}>
                        Cerrar Sesión
                    </Button>
                </Toolbar>
            </AppBar>

            <Drawer
                anchor="left"
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
            >
                <Box sx={{ width: 250 }} role="presentation">
                    <List>
                        {menuItems.map((item) => (
                            <ListItem
                                button
                                key={item.text}
                                onClick={() => handleMenuClick(item.path)}
                                selected={location.pathname === item.path}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItem>
                        ))}
                        <Divider />
                        <ListItem button onClick={handleLogout}>
                            <ListItemIcon><Logout /></ListItemIcon>
                            <ListItemText primary="Cerrar Sesión" />
                        </ListItem>
                    </List>
                </Box>
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    mt: 8,
                    minHeight: '100vh',
                    bgcolor: '#f5f5f5'
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout; 