import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Spinner, Center } from '@chakra-ui/react';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import Layout from './components/layout/Layout';


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
const MealsPage = React.lazy(() => import('./features/meals/pages/MealsPage'));
const MealList = React.lazy(() => import('./features/meals/components/MealList'));
const TemplateList = React.lazy(() => import('./features/meals/components/TemplateList'));
const MealDetails = React.lazy(() => import('./features/meals/components/MealDetails'));
const TemplateDetails = React.lazy(() => import('./features/meals/components/TemplateDetails'));


const AppRoutes = () => {

    const LoadingFallback = () => (
        <Center h="50vh">
            <Spinner size="xl" color="vscode.accent" />
        </Center>
    );

    return (
        <Layout>
            <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/request-account" element={<RequestAccountPage />} />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute data-testid="protected-route" requireAdmin>
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
                    <Route
                        path="/meals"
                        element={
                            <ProtectedRoute>
                                <MealsPage />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<MealList />} />
                        <Route path="templates" element={<TemplateList />} />
                    </Route>
                    <Route
                        path="/meals/:id"
                        element={
                            <ProtectedRoute>
                                <MealDetails />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/meals/templates/:id"
                        element={
                            <ProtectedRoute>
                                <TemplateDetails />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Suspense>
        </Layout>
    );
};

export default AppRoutes;
