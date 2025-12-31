import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';


function App() {
    return (
        <Router basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <AppRoutes />
        </Router>
    );
}

export default App;
