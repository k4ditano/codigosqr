import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import QrCodeIcon from '@mui/icons-material/QrCode';
import HistoryIcon from '@mui/icons-material/History';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

const menuItems = [
    {
        text: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/business'
    },
    {
        text: 'Validar Código',
        icon: <QrCodeIcon />,
        path: '/business/validar'
    },
    {
        text: 'Historial',
        icon: <HistoryIcon />,
        path: '/business/historial'
    },
    {
        text: 'Mi QR',
        icon: <QrCode2Icon />,
        path: '/business/mi-qr'
    },
    {
        text: 'Facturación',
        icon: <ReceiptIcon />,
        path: '/business/facturacion'
    }
];

const BusinessLayout = ({ children }) => {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const drawer = (
        <div>
            <Toolbar>
                <Typography variant="h6" noWrap component="div">
                    Panel Negocio
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem 
                        button 
                        key={item.text} 
                        component={Link} 
                        to={item.path}
                        selected={location.pathname === item.path}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
                <Divider />
                <ListItem button onClick={handleLogout}>
                    <ListItemIcon><LogoutIcon /></ListItemIcon>
                    <ListItemText primary="Cerrar Sesión" />
                </ListItem>
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` } }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        Sistema de Descuentos
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{ 
                    flexGrow: 1, 
                    p: 3, 
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    minHeight: '100vh'
                }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
};

export default BusinessLayout; 