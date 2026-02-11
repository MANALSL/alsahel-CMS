import { createContext, useContext, useState, useEffect } from 'react';

import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userData = await authService.getMe();
                    setUser(userData);
                } catch (error) {
                    console.error("Failed to fetch user:", error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (username, password) => {
        const data = await authService.login(username, password);
        const userData = await authService.getMe();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const changePassword = async () => {
        throw new Error('La modification du mot de passe n\'est pas encore implémentée sur le serveur.');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, changePassword, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
