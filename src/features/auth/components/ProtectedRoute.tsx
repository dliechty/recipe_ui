import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (user?.is_first_login && location.pathname !== '/change-password') {
        return <Navigate to="/change-password" replace />;
    }

    return children;
};

export default ProtectedRoute;
