import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { OpenAPI, AuthenticationService, UserPublic } from '../client';

interface AuthContextType {
    token: string | null;
    isAuthenticated: boolean;
    user: UserPublic | null;
    login: (newToken: string) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<UserPublic | null>(null);
    const isAuthenticated = !!token;

    // Define fetchUser outside to be used by refreshUser
    const fetchUser = React.useCallback(async () => {
        try {
            if (!token) return;

            const parts = token.split('.');
            if (parts.length !== 3) {
                // Not a valid JWT, maybe a mock or opaque token
                return;
            }
            const payload = JSON.parse(atob(parts[1]));
            const userId = payload.sub; // verify if sub is used
            const userData = await AuthenticationService.getUserNameAuthUsersUserIdGet(userId);
            setUser(userData);
        } catch (error) {
            console.error("Failed to fetch user", error);
            // Optional: logout if token invalid?
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            OpenAPI.TOKEN = token;
            localStorage.setItem('token', token);
            // Fetch user details
            fetchUser();
        } else {
            OpenAPI.TOKEN = undefined;
            localStorage.removeItem('token');
            setUser(null);
        }
    }, [token, fetchUser]);

    const login = (newToken: string) => {
        setToken(newToken);
    };

    const logout = () => {
        setToken(null);
    };

    const refreshUser = async () => {
        if (token) {
            await fetchUser();
        }
    };

    return (
        <AuthContext.Provider value={{ token, isAuthenticated, user, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
