import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import RecipeList from './components/RecipeList';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    return (
        <Router>
            <div>
                <nav>
                    <ul>
                        {token ? (
                            <>
                                <li><Link to="/recipes">Recipes</Link></li>
                                <li><button onClick={handleLogout}>Logout</button></li>
                            </>
                        ) : (
                            <li><Link to="/">Login</Link></li>
                        )}
                    </ul>
                </nav>
                <hr />
                <Routes>
                    <Route path="/" element={token ? <Navigate to="/recipes" /> : <LoginPage />} />
                    <Route
                        path="/recipes"
                        element={
                            <ProtectedRoute>
                                <RecipeList />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
