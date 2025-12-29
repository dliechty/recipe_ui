import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { OpenAPI, AuthenticationService, UserPublic } from '../client';

interface AuthContextType {
    token: string | null;
    isAuthenticated: boolean;
    user: UserPublic | null;
    login: (newToken: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<UserPublic | null>(null);
    const isAuthenticated = !!token;

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
    }, [token]);

    const fetchUser = async () => {
        try {
            // How to get current user ID?
            // If API doesn't have /me, we might need to rely on what we have.
            // Wait, looking at openapi.json again.
            // There is no /me.
            // BUT, usually the token contains the subject (sub) which is the user ID.
            // I can decode the token or maybe `listActiveUsersAuthUsersGet`? No that lists all.
            // I'll assume I can decode the token to get ID.
            // Simple decode (beware user might iterate faster than I can install jwt-decode).
            // Example custom decode:
            const parts = token!.split('.');
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
    };

    const login = (newToken: string) => {
        setToken(newToken);
    };

    const logout = () => {
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ token, isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
