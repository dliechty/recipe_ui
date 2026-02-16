import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin }: ProtectedRouteProps) => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (requireAdmin && !user?.is_admin) {
        return <Navigate to="/meals" replace />;
    }

    if (user?.is_first_login && location.pathname !== '/change-password') {
        return <Navigate to="/change-password" replace />;
    }

    return children;
};

export default ProtectedRoute;
