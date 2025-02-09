import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/admin/Dashboard';
import Negocios from './components/admin/Negocios';
import Codigos from './components/admin/Codigos';
import Formularios from './components/admin/Formularios';
import PrivateRoute from './components/PrivateRoute';
import BusinessDashboard from './components/business/BusinessDashboard';
import ValidarCodigo from './components/business/ValidarCodigo';
import HistorialCanjes from './components/business/HistorialCanjes';
import MiQR from './components/business/MiQR';
import FormularioCliente from './components/public/FormularioCliente';
import ValidarCodigoPublico from './components/public/ValidarCodigoPublico';
import Facturacion from './components/business/Facturacion';

const App = () => {
    return (
        <AuthProvider>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/form/:businessId" element={<FormularioCliente />} />
                        <Route path="/validar/:codigo" element={<ValidarCodigoPublico />} />
                        <Route element={<Layout />}>
                            <Route path="/admin" element={
                                <PrivateRoute>
                                    <Dashboard />
                                </PrivateRoute>
                            } />
                            <Route path="/admin/negocios" element={
                                <PrivateRoute>
                                    <Negocios />
                                </PrivateRoute>
                            } />
                            <Route path="/admin/codigos" element={
                                <PrivateRoute>
                                    <Codigos />
                                </PrivateRoute>
                            } />
                            <Route path="/admin/formularios" element={
                                <PrivateRoute>
                                    <Formularios />
                                </PrivateRoute>
                            } />
                            <Route path="/business" element={
                                <PrivateRoute>
                                    <BusinessDashboard />
                                </PrivateRoute>
                            } />
                            <Route path="/business/validar" element={
                                <PrivateRoute>
                                    <ValidarCodigo />
                                </PrivateRoute>
                            } />
                            <Route path="/business/historial" element={
                                <PrivateRoute>
                                    <HistorialCanjes />
                                </PrivateRoute>
                            } />
                            <Route path="/business/mi-qr" element={
                                <PrivateRoute>
                                    <MiQR />
                                </PrivateRoute>
                            } />
                            <Route path="/business/facturacion" element={
                                <PrivateRoute>
                                    <Facturacion />
                                </PrivateRoute>
                            } />
                            <Route path="/" element={<Navigate to="/admin" replace />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </LocalizationProvider>
        </AuthProvider>
    );
};

export default App; 