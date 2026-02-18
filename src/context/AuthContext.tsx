import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { OpenAPI, AuthenticationService, UserPublic } from '../client';
import { AdminModeContext } from './AdminModeContext';

interface AuthContextType {
    token: string | null;
    isAuthenticated: boolean;
    user: UserPublic | null;
    login: (newToken: string) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Inner component that reads AdminModeContext and sets OpenAPI.HEADERS reactively.
 * Gracefully handles the case where AdminModeProvider is not present (returns null context).
 * Exported for testing purposes.
 */
export function HeaderInjector({ user }: { user: UserPublic | null }) {
    const adminModeCtx = useContext(AdminModeContext);
    const adminModeActive = adminModeCtx?.adminModeActive ?? false;
    const impersonatedUserId = adminModeCtx?.impersonatedUserId ?? null;

    useEffect(() => {
        if (!user?.is_admin) {
            // Non-admin or no admin mode context: clear any custom headers
            OpenAPI.HEADERS = undefined;
            return;
        }

        if (impersonatedUserId) {
            // Impersonation takes precedence over admin mode
            OpenAPI.HEADERS = { 'X-Act-As-User': impersonatedUserId };
        } else if (adminModeActive) {
            OpenAPI.HEADERS = { 'X-Admin-Mode': 'true' };
        } else {
            // Default mode: no custom headers
            OpenAPI.HEADERS = undefined;
        }
    }, [user, adminModeActive, impersonatedUserId]);

    return null;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<UserPublic | null>(null);
    const isAuthenticated = !!token;

    // Parse JWT payload safely - returns null if invalid
    const parseJwtPayload = useCallback((jwtToken: string): { sub?: string } | null => {
        try {
            return jwtDecode<{ sub?: string }>(jwtToken);
        } catch {
            // Invalid token format
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
            <HeaderInjector user={user} />
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
