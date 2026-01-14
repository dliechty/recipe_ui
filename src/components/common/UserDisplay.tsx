import { Text, Skeleton } from '@chakra-ui/react';
import { useUser } from '../../hooks/useUsers';

interface UserDisplayProps {
    userId: string | undefined;
}

export const UserDisplay = ({ userId }: UserDisplayProps) => {
    const { data: user, isLoading, isError } = useUser(userId);

    if (isLoading) {
        return <Skeleton height="20px" width="100px" />;
    }

    if (isError || !user) {
        return <Text color="fg.muted">Unknown</Text>;
    }

    const displayName = user.first_name && user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user.first_name || user.email || 'Unknown';

    return <Text>{displayName}</Text>;
};
