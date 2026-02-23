import { Badge } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useAdminMode } from '../../../context/AdminModeContext';
import { useAuth } from '../../../context/AuthContext';
import { useUsers } from '../../../hooks/useUsers';

const AdminModeIndicator = () => {
    const { user } = useAuth();
    const { adminModeActive, impersonatedUserId } = useAdminMode();
    const { data: allUsers } = useUsers();

    // Only visible to admin users
    if (!user?.is_admin) {
        return null;
    }

    // Return null in default mode (no admin mode, no impersonation)
    if (!adminModeActive && !impersonatedUserId) {
        return null;
    }

    // Resolve impersonated user name
    let label: string;
    let colorPalette: string;

    if (impersonatedUserId) {
        const impersonatedUser = (allUsers ?? []).find(u => u.id === impersonatedUserId);
        const userName = impersonatedUser
            ? `${impersonatedUser.first_name} ${impersonatedUser.last_name}`
            : impersonatedUserId;
        label = `Acting as: ${userName}`;
        colorPalette = 'cyan';
    } else {
        label = 'Admin Mode';
        colorPalette = 'orange';
    }

    return (
        <Link to="/admin?tab=operating-mode">
            <Badge
                colorPalette={colorPalette}
                variant="subtle"
                fontSize="sm"
                px={3}
                py={1}
                borderRadius="full"
                cursor="pointer"
            >
                {label}
            </Badge>
        </Link>
    );
};

export default AdminModeIndicator;
