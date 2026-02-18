import { useState } from 'react';
import {
    Box,
    Text,
    Button,
    HStack,
    VStack,
    Badge,
} from '@chakra-ui/react';
import { useAdminMode } from '../../../context/AdminModeContext';
import { useUsers } from '../../../hooks/useUsers';

const AdminOperatingMode = () => {
    const {
        adminModeActive,
        impersonatedUserId,
        setAdminMode,
        setImpersonatedUser,
        clearMode,
    } = useAdminMode();

    const { data: allUsers, isLoading } = useUsers();
    const [selectedUserId, setSelectedUserId] = useState<string>('');

    // Filter to only non-admin users (UserPublic doesn't have is_active field)
    const nonAdminUsers = (allUsers ?? []).filter(u => !u.is_admin);

    // Find impersonated user's name
    const impersonatedUser = impersonatedUserId
        ? (allUsers ?? []).find(u => u.id === impersonatedUserId)
        : null;
    const impersonatedUserName = impersonatedUser
        ? `${impersonatedUser.first_name} ${impersonatedUser.last_name}`
        : null;

    // Compute current mode label
    let currentModeLabel: string;
    if (impersonatedUserId && impersonatedUserName) {
        currentModeLabel = `Impersonating — ${impersonatedUserName}`;
    } else if (adminModeActive) {
        currentModeLabel = 'Admin';
    } else {
        currentModeLabel = 'User (default)';
    }

    const handleStartImpersonating = () => {
        if (selectedUserId) {
            setImpersonatedUser(selectedUserId);
        }
    };

    return (
        <Box>
            <VStack align="stretch" gap={6}>
                {/* Mode Summary */}
                <Box
                    p={4}
                    borderRadius="md"
                    bg="bg.surface"
                    borderWidth="1px"
                    borderColor="border.default"
                >
                    <HStack>
                        <Text color="fg.muted" fontWeight="medium">Current mode:</Text>
                        <Badge
                            colorPalette={
                                impersonatedUserId ? 'cyan' : adminModeActive ? 'orange' : 'gray'
                            }
                            variant="subtle"
                            fontSize="sm"
                            px={3}
                            py={1}
                        >
                            {currentModeLabel}
                        </Badge>
                    </HStack>
                </Box>

                {/* Admin Mode Toggle */}
                <Box
                    p={5}
                    borderRadius="md"
                    bg="bg.surface"
                    borderWidth="1px"
                    borderColor="border.default"
                >
                    <VStack align="stretch" gap={3}>
                        <HStack justify="space-between">
                            <label
                                htmlFor="admin-mode-toggle"
                                style={{
                                    color: 'var(--chakra-colors-fg-default)',
                                    fontWeight: '600',
                                    fontSize: '16px',
                                    cursor: impersonatedUserId ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                }}
                            >
                                Admin Mode
                            </label>
                            <input
                                id="admin-mode-toggle"
                                type="checkbox"
                                role="checkbox"
                                aria-label="Admin Mode"
                                checked={adminModeActive}
                                disabled={!!impersonatedUserId}
                                onChange={(e) => setAdminMode(e.target.checked)}
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    cursor: impersonatedUserId ? 'not-allowed' : 'pointer',
                                    accentColor: 'var(--chakra-colors-blue-400)',
                                }}
                            />
                        </HStack>
                        <Text color="fg.muted" fontSize="sm">
                            Grants full access to all resources across all users
                        </Text>
                    </VStack>
                </Box>

                {/* Impersonation Control */}
                <Box
                    p={5}
                    borderRadius="md"
                    bg="bg.surface"
                    borderWidth="1px"
                    borderColor="border.default"
                >
                    <VStack align="stretch" gap={3}>
                        <Text color="fg.default" fontWeight="semibold" fontSize="md">
                            Impersonate User
                        </Text>
                        <Text color="fg.muted" fontSize="sm">
                            Scopes access to the selected user's data
                        </Text>

                        {impersonatedUserId ? (
                            <HStack>
                                <Text color="fg.default">
                                    Currently impersonating:{' '}
                                    <Text as="span" fontWeight="bold" color="cyan.400">
                                        {impersonatedUserName ?? impersonatedUserId}
                                    </Text>
                                </Text>
                                <Button
                                    size="sm"
                                    colorPalette="red"
                                    variant="outline"
                                    onClick={clearMode}
                                    aria-label="Stop Impersonating"
                                >
                                    Stop Impersonating
                                </Button>
                            </HStack>
                        ) : (
                            <HStack>
                                <Box flex={1}>
                                    <select
                                        value={selectedUserId}
                                        onChange={e => setSelectedUserId(e.target.value)}
                                        disabled={isLoading}
                                        aria-label="Select user to impersonate"
                                        style={{
                                            width: '100%',
                                            background: 'var(--chakra-colors-bg-surface)',
                                            color: 'var(--chakra-colors-fg-default)',
                                            border: '1px solid var(--chakra-colors-border-default)',
                                            borderRadius: '6px',
                                            padding: '8px 12px',
                                            fontSize: '14px',
                                        }}
                                    >
                                        <option value="">Select a user...</option>
                                        {nonAdminUsers.map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.first_name} {user.last_name} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                </Box>
                                <Button
                                    size="sm"
                                    colorPalette="blue"
                                    onClick={handleStartImpersonating}
                                    disabled={!selectedUserId}
                                    aria-label="Start Impersonating"
                                >
                                    Start Impersonating
                                </Button>
                            </HStack>
                        )}
                    </VStack>
                </Box>
            </VStack>
        </Box>
    );
};

export default AdminOperatingMode;
