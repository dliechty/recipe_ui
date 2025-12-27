import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RecipeList from './components/RecipeList';
import RecipeDetails from './components/RecipeDetails';
import AddRecipePage from './components/AddRecipePage';
import EditRecipePage from './components/EditRecipePage';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';

function App() {
    const { isAuthenticated, logout } = useAuth();

    return (
        <Router basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Layout>
                <Routes>
                    <Route path="/" element={isAuthenticated ? <Navigate to="/recipes" /> : <LoginPage />} />
                    <Route
                        path="/recipes"
                        element={
                            <ProtectedRoute>
                                <RecipeList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/recipes/new"
                        element={
                            <ProtectedRoute>
                                <AddRecipePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/recipes/:id"
                        element={
                            <ProtectedRoute>
                                <RecipeDetails />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/recipes/:id/edit"
                        element={
                            <ProtectedRoute>
                                <EditRecipePage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
