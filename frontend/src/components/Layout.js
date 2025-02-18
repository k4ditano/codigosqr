import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';

const Layout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box sx={{
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            flexDirection: 'column',
            padding: isMobile ? 1 : 2,
            overflowX: 'hidden'
        }}>
            <Outlet />
        </Box>
    );
};

export default Layout;
