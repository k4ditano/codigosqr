import React, { createContext, useState, useContext } from 'react';
import axiosClient from '../config/axios';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwt_decode(token);
            return decoded;
        }
        return null;
    });

    const login = async (credentials) => {
        try {
            console.log('Enviando credenciales:', credentials);
            const response = await axiosClient.post('/auth/login', credentials);
            const { token } = response.data;
            localStorage.setItem('token', token);
            const decoded = jwt_decode(token);
            setUser(decoded);
            return decoded;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext); 