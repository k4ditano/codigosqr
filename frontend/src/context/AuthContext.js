import React, { createContext, useState, useContext } from 'react';
import axiosClient from '../config/axios';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwt_decode(token);
                return decoded;
            } catch (e) {
                console.error('Error decodificando token:', e);
                localStorage.removeItem('token');
                return null;
            }
        }
        return null;
    });
    
    const [loading, setLoading] = useState(false);

    const login = async (credentials) => {
        try {
            console.log('Enviando petición de login a la API...');
            setLoading(true);
            
            const response = await axiosClient.post('/auth/login', credentials);
            console.log('Respuesta de login recibida:', response.status);
            
            const { token, user: userData } = response.data;
            localStorage.setItem('token', token);
            
            const decoded = jwt_decode(token);
            console.log('Token decodificado:', decoded);
            
            setUser(decoded);
            return decoded;
        } catch (error) {
            console.error('Error en la autenticación:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);