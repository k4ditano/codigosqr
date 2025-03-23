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
    ListItemText,
    useTheme,
    useMediaQuery
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StoreIcon from '@mui/icons-material/Store';
import QrCodeIcon from '@mui/icons-material/QrCode';
import EmailIcon from '@mui/icons-material/Email';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

const menuItems = [
    {
        text: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/admin'
    },
    {
        text: 'Negocios',
        icon: <StoreIcon />,
        path: '/admin/negocios'
    },
    {
        text: 'Códigos',
        icon: <QrCodeIcon />,
        path: '/admin/codigos'
    },
    {
        text: 'Formularios',
        icon: <EmailIcon />,
        path: '/admin/formularios'
    },
    {
        text: 'Facturación',
        icon: <ReceiptIcon />,
        path: '/admin/facturacion'
    },
    {
        text: 'Usuarios',
        icon: <PeopleIcon />,
        path: '/admin/usuarios'
    }
];

const AdminLayout = ({ children }) => {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
                <Typography
                    variant="h6"
                    noWrap
                    component="div"
                    sx={{
                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                    }}
                >
                    Panel colaboradores TARSIS
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
                        sx={{
                            py: { xs: 1, sm: 1.5 },
                            '& .MuiListItemIcon-root': {
                                minWidth: { xs: 40, sm: 48 }
                            }
                        }}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText
                            primary={item.text}
                            primaryTypographyProps={{
                                fontSize: { xs: '0.9rem', sm: '1rem' }
                            }}
                        />
                    </ListItem>
                ))}
                <Divider />
                <ListItem
                    button
                    onClick={handleLogout}
                    sx={{
                        py: { xs: 1, sm: 1.5 }
                    }}
                >
                    <ListItemIcon><LogoutIcon /></ListItemIcon>
                    <ListItemText
                        primary="Cerrar Sesión"
                        primaryTypographyProps={{
                            fontSize: { xs: '0.9rem', sm: '1rem' }
                        }}
                    />
                </ListItem>
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    '& .MuiToolbar-root': {
                        minHeight: { xs: 56, sm: 64 }
                    }
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{
                            mr: 2,
                            display: { sm: 'none' },
                            padding: { xs: 0.5, sm: 1 }
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{
                            fontSize: { xs: '1.1rem', sm: '1.25rem' }
                        }}
                    >
                        Sistema de Descuentos
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{
                    width: { sm: drawerWidth },
                    flexShrink: { sm: 0 }
                }}
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
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            width: { xs: '80%', sm: drawerWidth }
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth
                        },
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
                    p: { xs: 2, sm: 3 },
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    minHeight: '100vh',
                    mt: { xs: '56px', sm: '64px' }
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default AdminLayout;
