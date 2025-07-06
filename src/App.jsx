import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RecipeList from './components/RecipeList';
import LoginPage from './components/LoginPage';

function App() {
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <Router>
            <div>
                <nav>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        {token ? (
                            <li><button onClick={handleLogout}>Logout</button></li>
                        ) : (
                            <li><Link to="/login">Login</Link></li>
                        )}
                    </ul>
                </nav>
                <hr />
                <Routes>
                    <Route path="/" element={<RecipeList />} />
                    <Route path="/login" element={<LoginPage />} />
                    {/* You can add more routes here for creating, editing, and viewing single recipes */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;
