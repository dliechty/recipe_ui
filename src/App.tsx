import { BrowserRouter as Router } from 'react-router-dom';
import { useContext, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AppRoutes from './AppRoutes';
import { HeaderInjector, useAuth } from './context/AuthContext';
import { AdminModeContext } from './context/AdminModeContext';
import { OpenAPI } from './client';

function ConnectedHeaderInjector() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const adminModeCtx = useContext(AdminModeContext);
    const adminModeActive = adminModeCtx?.adminModeActive ?? false;
    const impersonatedUserId = adminModeCtx?.impersonatedUserId ?? null;
    // Track the serialized headers value so we can detect actual changes.
    // Initialized to null (sentinel) so the first run never triggers an invalidation.
    const prevHeadersKey = useRef<string | null>(null);

    useEffect(() => {
        // HeaderInjector (child) runs its effect first and updates OpenAPI.HEADERS.
        // We read the result here and invalidate all queries when the value changes,
        // ensuring data is refetched with the correct impersonation/admin headers.
        const currentKey = JSON.stringify(OpenAPI.HEADERS ?? null);
        if (prevHeadersKey.current !== null && prevHeadersKey.current !== currentKey) {
            queryClient.invalidateQueries();
        }
        prevHeadersKey.current = currentKey;
    }, [user, adminModeActive, impersonatedUserId, queryClient]);

    return <HeaderInjector user={user} />;
}

function App() {
    return (
        <Router basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <ConnectedHeaderInjector />
            <AppRoutes />
        </Router>
    );
}

export default App;
