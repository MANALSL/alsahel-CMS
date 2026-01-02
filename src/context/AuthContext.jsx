import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for existing session
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        // Mock API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (username && password.length >= 4) {
                    const userData = { id: 1, name: username, role: 'admin' };
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));

                    // Persist password mapping for demo purposes
                    try {
                        const key = 'users_passwords';
                        const store = JSON.parse(localStorage.getItem(key) || '{}');
                        store[username] = password;
                        localStorage.setItem(key, JSON.stringify(store));
                    } catch (e) {
                        // ignore
                    }

                    resolve(userData);
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 1000);
        });
    };

    const changePassword = async (currentPassword, newPassword) => {
        // Simple localStorage-backed password change for demo apps
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!user) return reject(new Error('Not authenticated'));
                const username = user.name;
                const key = 'users_passwords';
                const store = JSON.parse(localStorage.getItem(key) || '{}');

                // If a password was previously set, require it to match currentPassword
                if (store[username]) {
                    if (store[username] !== currentPassword) return reject(new Error('Current password is incorrect'));
                }

                if (!newPassword || newPassword.length < 4) return reject(new Error('New password must be at least 4 characters'));

                store[username] = newPassword;
                localStorage.setItem(key, JSON.stringify(store));
                resolve(true);
            }, 500);
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, changePassword, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
