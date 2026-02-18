import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { HeaderInjector, useAuth } from './context/AuthContext';

function ConnectedHeaderInjector() {
    const { user } = useAuth();
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
