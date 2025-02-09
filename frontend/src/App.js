import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';

// Admin components
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './components/admin/Dashboard';
import Negocios from './components/admin/Negocios';
import Codigos from './components/admin/Codigos';
import Formularios from './components/admin/Formularios';
import AdminFacturacion from './components/admin/Facturacion';

// Business components
import BusinessLayout from './layouts/BusinessLayout';
import BusinessDashboard from './components/business/BusinessDashboard';
import ValidarCodigo from './components/business/ValidarCodigo';
import HistorialCanjes from './components/business/HistorialCanjes';
import MiQR from './components/business/MiQR';
import BusinessFacturacion from './components/business/Facturacion';

// Public components
import FormularioCliente from './components/public/FormularioCliente';
import ValidarCodigoPublico from './components/public/ValidarCodigoPublico';

// Componente de redirección
const FormRedirect = () => {
    const { businessId } = useParams();
    return <Navigate to={`/formulario/${businessId}`} replace />;
};

const App = () => {
    return (
        <AuthProvider>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        
                        {/* Ruta de redirección usando el componente dedicado */}
                        <Route path="/form/:businessId" element={<FormRedirect />} />
                        
                        {/* Ruta principal del formulario */}
                        <Route path="/formulario/:businessId" element={<FormularioCliente />} />
                        <Route path="/validar/:codigo" element={<ValidarCodigoPublico />} />
                        
                        <Route element={<Layout />}>
                            {/* Admin Routes */}
                            <Route path="/admin" element={
                                <PrivateRoute>
                                    <AdminLayout>
                                        <Dashboard />
                                    </AdminLayout>
                                </PrivateRoute>
                            } />
                            <Route path="/admin/negocios" element={
                                <PrivateRoute>
                                    <AdminLayout>
                                        <Negocios />
                                    </AdminLayout>
                                </PrivateRoute>
                            } />
                            <Route path="/admin/codigos" element={
                                <PrivateRoute>
                                    <AdminLayout>
                                        <Codigos />
                                    </AdminLayout>
                                </PrivateRoute>
                            } />
                            <Route path="/admin/formularios" element={
                                <PrivateRoute>
                                    <AdminLayout>
                                        <Formularios />
                                    </AdminLayout>
                                </PrivateRoute>
                            } />
                            <Route path="/admin/facturacion" element={
                                <PrivateRoute>
                                    <AdminLayout>
                                        <AdminFacturacion />
                                    </AdminLayout>
                                </PrivateRoute>
                            } />

                            {/* Business Routes */}
                            <Route path="/business" element={
                                <PrivateRoute>
                                    <BusinessLayout>
                                        <BusinessDashboard />
                                    </BusinessLayout>
                                </PrivateRoute>
                            } />
                            <Route path="/business/validar" element={
                                <PrivateRoute>
                                    <BusinessLayout>
                                        <ValidarCodigo />
                                    </BusinessLayout>
                                </PrivateRoute>
                            } />
                            <Route path="/business/historial" element={
                                <PrivateRoute>
                                    <BusinessLayout>
                                        <HistorialCanjes />
                                    </BusinessLayout>
                                </PrivateRoute>
                            } />
                            <Route path="/business/mi-qr" element={
                                <PrivateRoute>
                                    <BusinessLayout>
                                        <MiQR />
                                    </BusinessLayout>
                                </PrivateRoute>
                            } />
                            <Route path="/business/facturacion" element={
                                <PrivateRoute>
                                    <BusinessLayout>
                                        <BusinessFacturacion />
                                    </BusinessLayout>
                                </PrivateRoute>
                            } />

                            <Route path="/" element={<Navigate to="/admin" replace />} />
                        </Route>
                    </Routes>
                </Router>
            </LocalizationProvider>
        </AuthProvider>
    );
};

export default App; 