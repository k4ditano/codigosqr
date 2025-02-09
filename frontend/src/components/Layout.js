import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

const Layout = () => {
    return (
        <Box sx={{ 
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: '#f5f5f5'  // Fondo gris claro
        }}>
            <Outlet />
        </Box>
    );
};

export default Layout; 