import { useQuery } from '@tanstack/react-query';
import { AuthenticationService, UserPublic } from '../client';

export const useUser = (userId: string | undefined) => {
    return useQuery<UserPublic>({
        queryKey: ['users', userId],
        queryFn: () => AuthenticationService.getUserNameAuthUsersUserIdGet(userId!),
        enabled: !!userId,
    });
};
