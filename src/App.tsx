import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Spinner, Center } from '@chakra-ui/react';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';

// Lazy load components
const RecipeList = React.lazy(() => import('./components/RecipeList'));
const RecipeDetails = React.lazy(() => import('./components/RecipeDetails'));
const AddRecipePage = React.lazy(() => import('./components/AddRecipePage'));
const EditRecipePage = React.lazy(() => import('./components/EditRecipePage'));
const LoginPage = React.lazy(() => import('./components/LoginPage'));

function App() {
    const { isAuthenticated } = useAuth();

    const LoadingFallback = () => (
        <Center h="50vh">
            <Spinner size="xl" color="vscode.accent" />
        </Center>
    );

    return (
        <Router basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Layout>
                <Suspense fallback={<LoadingFallback />}>
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
                </Suspense>
            </Layout>
        </Router>
    );
}

export default App;
