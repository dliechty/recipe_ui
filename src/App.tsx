import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Spinner, Center } from '@chakra-ui/react';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import Layout from './components/layout/Layout';
import { useAuth } from './context/AuthContext';

// Lazy load components
const RecipeList = React.lazy(() => import('./features/recipes/components/RecipeList'));
const RecipeDetails = React.lazy(() => import('./features/recipes/components/RecipeDetails'));
const AddRecipePage = React.lazy(() => import('./features/recipes/pages/AddRecipePage'));
const EditRecipePage = React.lazy(() => import('./features/recipes/pages/EditRecipePage'));
const LoginPage = React.lazy(() => import('./features/auth/components/LoginPage'));
const RequestAccountPage = React.lazy(() => import('./features/auth/components/RequestAccountPage'));
const AdminDashboard = React.lazy(() => import('./features/admin/pages/AdminDashboard'));
const ChangePasswordPage = React.lazy(() => import('./features/auth/components/ChangePasswordPage'));
const AccountPage = React.lazy(() => import('./features/users/AccountPage'));


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
                        <Route path="/request-account" element={<RequestAccountPage />} />
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute data-testid="protected-route">
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/account"
                            element={
                                <ProtectedRoute>
                                    <AccountPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/change-password"
                            element={
                                <ProtectedRoute>
                                    <ChangePasswordPage />
                                </ProtectedRoute>
                            }
                        />
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
