import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
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

    // Parse JWT payload safely - returns null if invalid
    const parseJwtPayload = useCallback((jwtToken: string): { sub?: string } | null => {
        try {
            const parts = jwtToken.split('.');
            if (parts.length !== 3) {
                // Not a valid JWT structure
                return null;
            }

            // Validate base64 format before decoding
            const base64Payload = parts[1];
            if (!/^[A-Za-z0-9_-]*$/.test(base64Payload)) {
                return null;
            }

            // Handle base64url encoding (replace URL-safe chars)
            const normalizedPayload = base64Payload
                .replace(/-/g, '+')
                .replace(/_/g, '/');

            const decoded = atob(normalizedPayload);
            const payload = JSON.parse(decoded);

            // Validate expected payload structure
            if (typeof payload !== 'object' || payload === null) {
                return null;
            }

            return payload;
        } catch {
            // Invalid base64, invalid JSON, or other parsing error
            return null;
        }
    }, []);

    // Define fetchUser outside to be used by refreshUser
    const fetchUser = useCallback(async () => {
        if (!token) return;

        const payload = parseJwtPayload(token);
        if (!payload?.sub) {
            // Invalid token structure - clear auth state
            console.error("Invalid token format - missing user ID");
            setToken(null);
            return;
        }

        try {
            const userData = await AuthenticationService.getUserNameAuthUsersUserIdGet(payload.sub);
            setUser(userData);
        } catch (error) {
            console.error("Failed to fetch user", error);
            // Token might be expired or invalid - let the 401 interceptor handle logout
        }
    }, [token, parseJwtPayload]);

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

    const login = useCallback((newToken: string) => {
        setToken(newToken);
    }, []);

    const logout = useCallback(() => {
        setToken(null);
    }, []);

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    logout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [logout]);

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
