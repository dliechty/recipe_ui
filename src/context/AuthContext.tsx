import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { OpenAPI, AuthenticationService, UserPublic } from '../client';
import { AdminModeContext } from './AdminModeContext';
import { HouseholdContext } from './HouseholdContext';

const STORAGE_KEY_TOKEN = 'token';
const STORAGE_KEY_REMEMBER_ME = 'rememberMe';
const STORAGE_KEY_SESSION_EXPIRY = 'sessionExpiry';
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface AuthContextType {
    token: string | null;
    isAuthenticated: boolean;
    user: UserPublic | null;
    login: (newToken: string, rememberMe?: boolean) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getStoredToken(): string | null {
    // Check if "remember me" was used (localStorage) or session-only (sessionStorage)
    const rememberMe = localStorage.getItem(STORAGE_KEY_REMEMBER_ME) === 'true';
    if (rememberMe) {
        const expiry = localStorage.getItem(STORAGE_KEY_SESSION_EXPIRY);
        if (expiry && Date.now() > Number(expiry)) {
            // Session expired — clear stored auth data
            localStorage.removeItem(STORAGE_KEY_TOKEN);
            localStorage.removeItem(STORAGE_KEY_SESSION_EXPIRY);
            localStorage.removeItem(STORAGE_KEY_REMEMBER_ME);
            return null;
        }
        return localStorage.getItem(STORAGE_KEY_TOKEN);
    }
    // Fall back to sessionStorage for non-remembered sessions
    return sessionStorage.getItem(STORAGE_KEY_TOKEN);
}

function clearStoredToken() {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_SESSION_EXPIRY);
    localStorage.removeItem(STORAGE_KEY_REMEMBER_ME);
    sessionStorage.removeItem(STORAGE_KEY_TOKEN);
}

function storeToken(token: string, rememberMe: boolean) {
    if (rememberMe) {
        localStorage.setItem(STORAGE_KEY_TOKEN, token);
        localStorage.setItem(STORAGE_KEY_REMEMBER_ME, 'true');
        localStorage.setItem(STORAGE_KEY_SESSION_EXPIRY, String(Date.now() + SESSION_DURATION_MS));
        sessionStorage.removeItem(STORAGE_KEY_TOKEN);
    } else {
        sessionStorage.setItem(STORAGE_KEY_TOKEN, token);
        localStorage.removeItem(STORAGE_KEY_TOKEN);
        localStorage.removeItem(STORAGE_KEY_SESSION_EXPIRY);
        localStorage.setItem(STORAGE_KEY_REMEMBER_ME, 'false');
    }
}

/**
 * Inner component that reads AdminModeContext and sets OpenAPI.HEADERS reactively.
 * Gracefully handles the case where AdminModeProvider is not present (returns null context).
 * Exported for testing purposes.
 */
export function HeaderInjector({ user }: { user: UserPublic | null }) {
    const adminModeCtx = useContext(AdminModeContext);
    const adminModeActive = adminModeCtx?.adminModeActive ?? false;
    const impersonatedUserId = adminModeCtx?.impersonatedUserId ?? null;

    const householdCtx = useContext(HouseholdContext);
    const activeHouseholdId = householdCtx?.activeHouseholdId ?? null;

    useEffect(() => {
        // Build admin/impersonation headers (admin users only)
        const adminHeaders: Record<string, string> = {};
        if (user?.is_admin) {
            if (impersonatedUserId) {
                // Impersonation takes precedence over admin mode
                adminHeaders['X-Act-As-User'] = impersonatedUserId;
            } else if (adminModeActive) {
                adminHeaders['X-Admin-Mode'] = 'true';
            }
        }

        // Build household header (all users)
        const householdHeaders: Record<string, string> = {};
        if (activeHouseholdId) {
            householdHeaders['X-Active-Household'] = activeHouseholdId;
        }

        const merged = { ...adminHeaders, ...householdHeaders };

        if (Object.keys(merged).length === 0) {
            OpenAPI.HEADERS = undefined;
        } else {
            OpenAPI.HEADERS = merged;
        }
    }, [user, adminModeActive, impersonatedUserId, activeHouseholdId]);

    return null;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(() => {
        const stored = getStoredToken();
        // Set synchronously so React Query hooks don't fire unauthenticated
        // requests before the useEffect below has a chance to run.
        if (stored) OpenAPI.TOKEN = stored;
        return stored;
    });
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
            // Fetch user details
            fetchUser();
        } else {
            OpenAPI.TOKEN = undefined;
            clearStoredToken();
            setUser(null);
        }
    }, [token, fetchUser]);

    const login = useCallback((newToken: string, rememberMe = true) => {
        OpenAPI.TOKEN = newToken;
        storeToken(newToken, rememberMe);
        setToken(newToken);
    }, []);

    const logout = useCallback(() => {
        OpenAPI.TOKEN = undefined;
        clearStoredToken();
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

// eslint-disable-next-line react-refresh/only-export-components -- Context module exports both AuthProvider component and useAuth hook; splitting would add complexity without benefit
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
