import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

const STORAGE_KEY_ADMIN_MODE = 'admin_mode_active';
const STORAGE_KEY_IMPERSONATED_USER = 'impersonated_user_id';

interface AdminModeContextType {
    adminModeActive: boolean;
    impersonatedUserId: string | null;
    setAdminMode: (active: boolean) => void;
    setImpersonatedUser: (userId: string) => void;
    clearMode: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AdminModeContext = createContext<AdminModeContextType | null>(null);

export const AdminModeProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();

    const [adminModeActive, setAdminModeActive] = useState<boolean>(() => {
        return localStorage.getItem(STORAGE_KEY_ADMIN_MODE) === 'true';
    });

    const [impersonatedUserId, setImpersonatedUserId] = useState<string | null>(() => {
        return localStorage.getItem(STORAGE_KEY_IMPERSONATED_USER) ?? null;
    });

    // Track whether a user has ever been loaded in this session, to distinguish
    // "initial page load (user is null while fetching)" from "actual logout".
    const hadUser = useRef(false);

    // Auto-clear state only on actual logout (user transitions from non-null → null).
    useEffect(() => {
        if (user) {
            hadUser.current = true;
        } else if (hadUser.current) {
            hadUser.current = false;
            setAdminModeActive(false);
            setImpersonatedUserId(null);
            localStorage.removeItem(STORAGE_KEY_ADMIN_MODE);
            localStorage.removeItem(STORAGE_KEY_IMPERSONATED_USER);
        }
    }, [user]);

    const setAdminMode = useCallback((active: boolean) => {
        if (!user?.is_admin) return;

        setAdminModeActive(active);
        localStorage.setItem(STORAGE_KEY_ADMIN_MODE, String(active));
    }, [user]);

    const setImpersonatedUser = useCallback((userId: string) => {
        if (!user?.is_admin) return;

        // Setting impersonation clears admin mode
        setImpersonatedUserId(userId);
        setAdminModeActive(false);
        localStorage.setItem(STORAGE_KEY_IMPERSONATED_USER, userId);
        localStorage.setItem(STORAGE_KEY_ADMIN_MODE, 'false');
    }, [user]);

    const clearMode = useCallback(() => {
        setAdminModeActive(false);
        setImpersonatedUserId(null);
        localStorage.removeItem(STORAGE_KEY_ADMIN_MODE);
        localStorage.removeItem(STORAGE_KEY_IMPERSONATED_USER);
    }, []);

    return (
        <AdminModeContext.Provider
            value={{
                adminModeActive,
                impersonatedUserId,
                setAdminMode,
                setImpersonatedUser,
                clearMode,
            }}
        >
            {children}
        </AdminModeContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminMode = () => {
    const context = useContext(AdminModeContext);
    if (!context) {
        throw new Error('useAdminMode must be used within an AdminModeProvider');
    }
    return context;
};
