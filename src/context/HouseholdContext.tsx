import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { AdminModeContext } from './AdminModeContext';
import { HouseholdsService, Household } from '../client';

const STORAGE_KEY_ACTIVE_HOUSEHOLD = 'active_household_id';

interface HouseholdContextType {
    activeHouseholdId: string | null;
    setActiveHousehold: (id: string | null) => void;
    primaryHouseholdId: string | null;
    households: Household[];
}

// eslint-disable-next-line react-refresh/only-export-components
export const HouseholdContext = createContext<HouseholdContextType | null>(null);

export const HouseholdProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();

    // Safely read AdminModeContext — gracefully handles absent AdminModeProvider
    const adminModeCtx = useContext(AdminModeContext);
    const impersonatedUserId = adminModeCtx?.impersonatedUserId ?? null;

    const [activeHouseholdId, setActiveHouseholdId] = useState<string | null>(() => {
        return localStorage.getItem(STORAGE_KEY_ACTIVE_HOUSEHOLD) ?? null;
    });

    const [primaryHouseholdId, setPrimaryHouseholdId] = useState<string | null>(null);
    const [households, setHouseholds] = useState<Household[]>([]);

    // Track whether a user has ever been loaded, to distinguish initial load from logout
    const hadUser = useRef(false);
    // Track the previous impersonated user ID to detect changes
    const prevImpersonatedUserId = useRef<string | null>(impersonatedUserId);

    const setActiveHousehold = useCallback((id: string | null) => {
        setActiveHouseholdId(id);
        if (id === null) {
            localStorage.removeItem(STORAGE_KEY_ACTIVE_HOUSEHOLD);
        } else {
            localStorage.setItem(STORAGE_KEY_ACTIVE_HOUSEHOLD, id);
        }
    }, []);

    // Reset state on logout (user transitions from non-null to null)
    useEffect(() => {
        if (user) {
            hadUser.current = true;
        } else if (hadUser.current) {
            hadUser.current = false;
            setActiveHouseholdId(null);
            setPrimaryHouseholdId(null);
            setHouseholds([]);
            localStorage.removeItem(STORAGE_KEY_ACTIVE_HOUSEHOLD);
        }
    }, [user]);

    // Reset state when impersonation changes (impersonatedUserId transitions)
    useEffect(() => {
        if (prevImpersonatedUserId.current !== impersonatedUserId) {
            prevImpersonatedUserId.current = impersonatedUserId;
            // Clear active household when impersonation context changes
            setActiveHouseholdId(null);
            setPrimaryHouseholdId(null);
            localStorage.removeItem(STORAGE_KEY_ACTIVE_HOUSEHOLD);
        }
    }, [impersonatedUserId]);

    // Fetch households when user/impersonation context changes
    useEffect(() => {
        if (!user) {
            setHouseholds([]);
            setPrimaryHouseholdId(null);
            return;
        }

        let cancelled = false;

        async function fetchHouseholds() {
            try {
                const data = await HouseholdsService.listHouseholdsHouseholdsGet();
                if (cancelled) return;

                setHouseholds(data);

                // Determine primary household by fetching members for each household
                // and finding which one has the current user as is_primary=true
                const userId = user!.id;
                let foundPrimary: string | null = null;

                const memberChecks = await Promise.allSettled(
                    data.map(h => HouseholdsService.listMembersHouseholdsHouseholdIdMembersGet(h.id))
                );

                if (cancelled) return;

                for (let i = 0; i < memberChecks.length; i++) {
                    const result = memberChecks[i];
                    if (result.status === 'fulfilled') {
                        const members = result.value;
                        const userMember = members.find(m => m.user_id === userId);
                        if (userMember?.is_primary) {
                            foundPrimary = data[i].id;
                            break;
                        }
                    }
                }

                setPrimaryHouseholdId(foundPrimary);

                // Auto-activate primary household only if no stored preference exists
                const storedHousehold = localStorage.getItem(STORAGE_KEY_ACTIVE_HOUSEHOLD);
                if (!storedHousehold && foundPrimary) {
                    // Validate the primary household is still in the list
                    const isValid = data.some(h => h.id === foundPrimary);
                    if (isValid) {
                        setActiveHouseholdId(foundPrimary);
                        localStorage.setItem(STORAGE_KEY_ACTIVE_HOUSEHOLD, foundPrimary);
                    }
                } else if (storedHousehold) {
                    // Validate the stored household is still valid
                    const isValid = data.some(h => h.id === storedHousehold);
                    if (!isValid) {
                        // Stored household no longer valid — fall back to primary or null
                        const fallback = foundPrimary && data.some(h => h.id === foundPrimary)
                            ? foundPrimary
                            : null;
                        setActiveHouseholdId(fallback);
                        if (fallback) {
                            localStorage.setItem(STORAGE_KEY_ACTIVE_HOUSEHOLD, fallback);
                        } else {
                            localStorage.removeItem(STORAGE_KEY_ACTIVE_HOUSEHOLD);
                        }
                    }
                }
            } catch (error) {
                if (!cancelled) {
                    console.error('Failed to fetch households', error);
                }
            }
        }

        fetchHouseholds();

        return () => {
            cancelled = true;
        };
    // Re-fetch when user or impersonation context changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, impersonatedUserId]);

    return (
        <HouseholdContext.Provider
            value={{
                activeHouseholdId,
                setActiveHousehold,
                primaryHouseholdId,
                households,
            }}
        >
            {children}
        </HouseholdContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHouseholdContext = () => {
    const context = useContext(HouseholdContext);
    if (!context) {
        throw new Error('useHouseholdContext must be used within a HouseholdProvider');
    }
    return context;
};
