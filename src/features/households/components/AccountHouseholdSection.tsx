import { useState } from 'react';
import {
    Box,
    Button,
    Heading,
    HStack,
    Input,
    Text,
    VStack,
} from '@chakra-ui/react';
import { useAuth } from '../../../context/AuthContext';
import { useHouseholdContext } from '../../../context/HouseholdContext';
import {
    useHouseholds,
    useHouseholdMembers,
    useCreateHousehold,
    useUpdateHousehold,
    useDeleteHousehold,
    useJoinHousehold,
    useLeaveHousehold,
    useRemoveHouseholdMember,
    useSetPrimaryHousehold,
} from '../../../hooks/useHouseholds';
import { Household, HouseholdMember } from '../../../client';

// ---------------------------------------------------------------------------
// Sub-component: single household row
// ---------------------------------------------------------------------------

interface HouseholdRowProps {
    household: Household;
    currentUserId: string;
    isPrimary: boolean;
    onSetPrimary: (id: string) => void;
    onUnsetPrimary: (id: string) => void;
    onLeave: (id: string) => void;
    onDelete: (id: string) => void;
    onRename: (id: string, name: string) => void;
}

const HouseholdMemberList = ({
    household,
    currentUserId,
    isCreator,
}: {
    household: Household;
    currentUserId: string;
    isCreator: boolean;
}) => {
    const { data: members = [] } = useHouseholdMembers(household.id);
    const { mutate: removeMember } = useRemoveHouseholdMember();

    const handleRemove = (userId: string) => {
        removeMember({ householdId: household.id, userId });
    };

    return (
        <Box data-testid={`member-list-${household.id}`} mt={2} pl={4}>
            <Text fontSize="xs" color="fg.muted" mb={2} textTransform="uppercase" letterSpacing="wider">
                Members
            </Text>
            <VStack align="stretch" gap={1}>
                {members.map((member: HouseholdMember) => {
                    const displayName =
                        member.user.first_name || member.user.last_name
                            ? `${member.user.first_name ?? ''} ${member.user.last_name ?? ''}`.trim()
                            : member.user.email;
                    const isCurrentUser = member.user_id === currentUserId;
                    return (
                        <HStack key={member.user_id} justify="space-between" align="center">
                            <Text fontSize="sm" color="fg.default">
                                {displayName}
                                {isCurrentUser && (
                                    <Text as="span" fontSize="xs" color="fg.muted" ml={1}>
                                        (you)
                                    </Text>
                                )}
                            </Text>
                            {isCreator && !isCurrentUser && (
                                <Button
                                    data-testid={`remove-member-btn-${household.id}-${member.user_id}`}
                                    size="2xs"
                                    variant="outline"
                                    colorPalette="red"
                                    borderColor="red.500"
                                    color="red.400"
                                    _hover={{ bg: 'red.900' }}
                                    onClick={() => handleRemove(member.user_id)}
                                >
                                    Remove
                                </Button>
                            )}
                        </HStack>
                    );
                })}
            </VStack>
        </Box>
    );
};

const HouseholdRow = ({
    household,
    currentUserId,
    isPrimary,
    onSetPrimary,
    onUnsetPrimary,
    onLeave,
    onDelete,
    onRename,
}: HouseholdRowProps) => {
    const { data: members = [] } = useHouseholdMembers(household.id);
    const isCreator = household.created_by === currentUserId;
    const [showMembers, setShowMembers] = useState(false);
    const [renameValue, setRenameValue] = useState(household.name);

    const handleTogglePrimary = () => {
        if (isPrimary) {
            onUnsetPrimary(household.id);
        } else {
            onSetPrimary(household.id);
        }
    };

    const handleRenameSubmit = () => {
        if (renameValue.trim() && renameValue.trim() !== household.name) {
            onRename(household.id, renameValue.trim());
        }
    };

    return (
        <Box
            data-testid={`household-row-${household.id}`}
            bg="bg.muted"
            borderRadius="md"
            borderWidth={1}
            borderColor="border.default"
            p={4}
        >
            {/* Header row: name + badges */}
            <HStack justify="space-between" align="start" mb={3}>
                <VStack align="stretch" gap={1} flex={1}>
                    <HStack gap={2} flexWrap="wrap">
                        <Text fontWeight="bold" color="fg.default" fontSize="md">
                            {household.name}
                        </Text>
                        <Text
                            data-testid={`role-badge-${household.id}`}
                            fontSize="xs"
                            px={2}
                            py={0.5}
                            borderRadius="full"
                            bg={isCreator ? 'blue.900' : 'gray.700'}
                            color={isCreator ? 'blue.200' : 'gray.300'}
                            fontWeight="semibold"
                        >
                            {isCreator ? 'Creator' : 'Member'}
                        </Text>
                        {isPrimary && (
                            <Text
                                data-testid={`primary-badge-${household.id}`}
                                fontSize="xs"
                                px={2}
                                py={0.5}
                                borderRadius="full"
                                bg="yellow.900"
                                color="yellow.300"
                                fontWeight="semibold"
                            >
                                Primary
                            </Text>
                        )}
                    </HStack>
                    <Text fontSize="xs" color="fg.muted">
                        {members.length} member{members.length !== 1 ? 's' : ''}
                    </Text>
                </VStack>
            </HStack>

            {/* Rename (creator only) */}
            {isCreator && (
                <HStack mb={3} gap={2}>
                    <Input
                        data-testid={`rename-input-${household.id}`}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        size="sm"
                        bg="vscode.inputBg"
                        borderColor="border.default"
                        color="fg.default"
                        _hover={{ borderColor: 'vscode.accent' }}
                        _focus={{
                            borderColor: 'vscode.accent',
                            boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)',
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameSubmit();
                        }}
                    />
                    <Button
                        data-testid={`rename-submit-btn-${household.id}`}
                        size="sm"
                        bg="vscode.button"
                        color="white"
                        _hover={{ bg: 'vscode.buttonHover' }}
                        onClick={handleRenameSubmit}
                        disabled={!renameValue.trim() || renameValue.trim() === household.name}
                    >
                        Rename
                    </Button>
                </HStack>
            )}

            {/* Action buttons */}
            <HStack gap={2} flexWrap="wrap">
                {/* Set/Unset Primary */}
                <Button
                    data-testid={`set-primary-btn-${household.id}`}
                    size="xs"
                    variant="outline"
                    borderColor="yellow.500"
                    color="yellow.400"
                    _hover={{ bg: 'yellow.900' }}
                    onClick={handleTogglePrimary}
                >
                    {isPrimary ? 'Unset Primary' : 'Set Primary'}
                </Button>

                {/* Manage Members */}
                <Button
                    data-testid={`manage-members-btn-${household.id}`}
                    size="xs"
                    variant="outline"
                    borderColor="border.default"
                    color="fg.muted"
                    _hover={{ bg: 'whiteAlpha.100' }}
                    onClick={() => setShowMembers((prev) => !prev)}
                >
                    {showMembers ? 'Hide Members' : 'Manage Members'}
                </Button>

                {/* Leave */}
                <Button
                    data-testid={`leave-btn-${household.id}`}
                    size="xs"
                    variant="outline"
                    borderColor="orange.500"
                    color="orange.400"
                    _hover={{ bg: 'orange.900' }}
                    onClick={() => onLeave(household.id)}
                >
                    Leave
                </Button>

                {/* Delete (creator only) */}
                {isCreator && (
                    <Button
                        data-testid={`delete-btn-${household.id}`}
                        size="xs"
                        variant="outline"
                        borderColor="red.500"
                        color="red.400"
                        _hover={{ bg: 'red.900' }}
                        onClick={() => onDelete(household.id)}
                    >
                        Delete
                    </Button>
                )}
            </HStack>

            {/* Expanded member list */}
            {showMembers && (
                <HouseholdMemberList
                    household={household}
                    currentUserId={currentUserId}
                    isCreator={isCreator}
                />
            )}
        </Box>
    );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const AccountHouseholdSection = () => {
    const { user } = useAuth();
    const { primaryHouseholdId } = useHouseholdContext();
    const { data: households = [] } = useHouseholds();

    const { mutate: setPrimary } = useSetPrimaryHousehold();
    const { mutate: createHousehold, isPending: isCreating } = useCreateHousehold();
    const { mutate: updateHousehold } = useUpdateHousehold();
    const { mutate: deleteHousehold } = useDeleteHousehold();
    const { mutate: joinHousehold, isPending: isJoining } = useJoinHousehold();
    const { mutate: leaveHousehold } = useLeaveHousehold();

    // Dialog states
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newHouseholdName, setNewHouseholdName] = useState('');

    const [showJoinDialog, setShowJoinDialog] = useState(false);
    const [joinHouseholdId, setJoinHouseholdId] = useState('');

    const [leaveTargetId, setLeaveTargetId] = useState<string | null>(null);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    const currentUserId = user?.id ?? '';

    // ---------------------------------------------------------------------------
    // Handlers
    // ---------------------------------------------------------------------------

    const handleSetPrimary = (id: string) => {
        setPrimary({ household_id: id });
    };

    const handleUnsetPrimary = (id: string) => {
        // id is the current primary — clear it
        void id;
        setPrimary({ household_id: null });
    };

    const handleLeaveClick = (id: string) => {
        setLeaveTargetId(id);
    };

    const handleLeaveConfirm = () => {
        if (leaveTargetId) {
            leaveHousehold(leaveTargetId);
            setLeaveTargetId(null);
        }
    };

    const handleLeaveCancel = () => {
        setLeaveTargetId(null);
    };

    const handleDeleteClick = (id: string) => {
        setDeleteTargetId(id);
    };

    const handleDeleteConfirm = () => {
        if (deleteTargetId) {
            deleteHousehold(deleteTargetId);
            setDeleteTargetId(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteTargetId(null);
    };

    const handleRename = (id: string, name: string) => {
        updateHousehold({ id, requestBody: { name } });
    };

    const handleCreateSubmit = () => {
        if (!newHouseholdName.trim()) return;
        createHousehold({ name: newHouseholdName.trim() }, {
            onSuccess: () => {
                setNewHouseholdName('');
                setShowCreateDialog(false);
            },
        });
    };

    const handleCreateCancel = () => {
        setNewHouseholdName('');
        setShowCreateDialog(false);
    };

    const handleJoinSubmit = () => {
        if (!joinHouseholdId.trim()) return;
        joinHousehold(joinHouseholdId.trim(), {
            onSuccess: () => {
                setJoinHouseholdId('');
                setShowJoinDialog(false);
            },
        });
    };

    const handleJoinCancel = () => {
        setJoinHouseholdId('');
        setShowJoinDialog(false);
    };

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
        <>
            <Box
                mt={6}
                p={8}
                borderWidth={1}
                borderColor="border.default"
                borderRadius="lg"
                boxShadow="lg"
                bg="bg.surface"
            >
                <HStack justify="space-between" align="center" mb={4}>
                    <Heading size="md" color="fg.default">
                        My Households
                    </Heading>
                    <HStack gap={2}>
                        <Button
                            data-testid="create-household-btn"
                            size="sm"
                            bg="vscode.button"
                            color="white"
                            _hover={{ bg: 'vscode.buttonHover' }}
                            onClick={() => setShowCreateDialog(true)}
                        >
                            Create Household
                        </Button>
                        <Button
                            data-testid="join-household-btn"
                            size="sm"
                            variant="outline"
                            borderColor="vscode.accent"
                            color="vscode.accent"
                            _hover={{ bg: 'whiteAlpha.100' }}
                            onClick={() => setShowJoinDialog(true)}
                        >
                            Join Household
                        </Button>
                    </HStack>
                </HStack>

                {households.length === 0 ? (
                    <Box data-testid="no-households-message" py={6} textAlign="center">
                        <Text color="fg.muted">
                            You are not a member of any households yet. Create one or join an existing one.
                        </Text>
                    </Box>
                ) : (
                    <VStack align="stretch" gap={4}>
                        {households.map((household: Household) => (
                            <HouseholdRow
                                key={household.id}
                                household={household}
                                currentUserId={currentUserId}
                                isPrimary={primaryHouseholdId === household.id}
                                onSetPrimary={handleSetPrimary}
                                onUnsetPrimary={handleUnsetPrimary}
                                onLeave={handleLeaveClick}
                                onDelete={handleDeleteClick}
                                onRename={handleRename}
                            />
                        ))}
                    </VStack>
                )}
            </Box>

            {/* ---------------------------------------------------------------- */}
            {/* Leave Confirmation Dialog                                         */}
            {/* ---------------------------------------------------------------- */}
            {leaveTargetId !== null && (
                <Box
                    data-testid="leave-confirm-dialog"
                    position="fixed"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg="overlay.backdrop"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    zIndex={1200}
                    backdropFilter="blur(4px)"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) handleLeaveCancel();
                    }}
                >
                    <Box
                        bg="bg.surface"
                        borderRadius="xl"
                        maxW="400px"
                        w="90%"
                        boxShadow="xl"
                        borderWidth={1}
                        borderColor="border.default"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Box p={4} borderBottomWidth={1} borderColor="border.default">
                            <Heading size="md" color="fg.default">Leave Household</Heading>
                        </Box>
                        <Box p={6}>
                            <Text color="fg.default">
                                Are you sure you want to leave this household?
                            </Text>
                        </Box>
                        <HStack justify="flex-end" p={4} gap={3} borderTopWidth={1} borderColor="border.default">
                            <Button
                                data-testid="leave-confirm-btn"
                                bg="orange.600"
                                color="white"
                                _hover={{ bg: 'orange.700' }}
                                size="sm"
                                onClick={handleLeaveConfirm}
                            >
                                Leave
                            </Button>
                            <Button
                                data-testid="leave-cancel-btn"
                                variant="ghost"
                                bg="button.secondary"
                                color="white"
                                _hover={{ bg: 'button.secondaryHover' }}
                                size="sm"
                                onClick={handleLeaveCancel}
                            >
                                Cancel
                            </Button>
                        </HStack>
                    </Box>
                </Box>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* Delete Confirmation Dialog                                        */}
            {/* ---------------------------------------------------------------- */}
            {deleteTargetId !== null && (
                <Box
                    data-testid="delete-confirm-dialog"
                    position="fixed"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg="overlay.backdrop"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    zIndex={1200}
                    backdropFilter="blur(4px)"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) handleDeleteCancel();
                    }}
                >
                    <Box
                        bg="bg.surface"
                        borderRadius="xl"
                        maxW="400px"
                        w="90%"
                        boxShadow="xl"
                        borderWidth={1}
                        borderColor="border.default"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Box p={4} borderBottomWidth={1} borderColor="border.default">
                            <Heading size="md" color="fg.default">Delete Household</Heading>
                        </Box>
                        <Box p={6}>
                            <Text color="fg.default">
                                Are you sure you want to permanently delete this household? This action cannot be undone.
                            </Text>
                        </Box>
                        <HStack justify="flex-end" p={4} gap={3} borderTopWidth={1} borderColor="border.default">
                            <Button
                                data-testid="delete-confirm-btn"
                                bg="red.600"
                                color="white"
                                _hover={{ bg: 'red.700' }}
                                size="sm"
                                onClick={handleDeleteConfirm}
                            >
                                Delete
                            </Button>
                            <Button
                                data-testid="delete-cancel-btn"
                                variant="ghost"
                                bg="button.secondary"
                                color="white"
                                _hover={{ bg: 'button.secondaryHover' }}
                                size="sm"
                                onClick={handleDeleteCancel}
                            >
                                Cancel
                            </Button>
                        </HStack>
                    </Box>
                </Box>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* Create Household Dialog                                           */}
            {/* ---------------------------------------------------------------- */}
            {showCreateDialog && (
                <Box
                    data-testid="create-household-dialog"
                    position="fixed"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg="overlay.backdrop"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    zIndex={1200}
                    backdropFilter="blur(4px)"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !isCreating) handleCreateCancel();
                    }}
                >
                    <Box
                        bg="bg.surface"
                        borderRadius="xl"
                        maxW="400px"
                        w="90%"
                        boxShadow="xl"
                        borderWidth={1}
                        borderColor="border.default"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <HStack
                            justify="space-between"
                            p={4}
                            borderBottomWidth={1}
                            borderColor="border.default"
                        >
                            <Heading size="md" color="fg.default">Create Household</Heading>
                            <Button
                                size="xs"
                                variant="ghost"
                                color="fg.muted"
                                _hover={{ color: 'fg.default' }}
                                onClick={handleCreateCancel}
                                disabled={isCreating}
                            >
                                ✕
                            </Button>
                        </HStack>

                        <VStack p={6} align="stretch" gap={4}>
                            <Box>
                                <Text fontSize="sm" fontWeight="medium" mb={2} color="fg.default">
                                    Household Name
                                </Text>
                                <Input
                                    data-testid="create-household-name-input"
                                    value={newHouseholdName}
                                    onChange={(e) => setNewHouseholdName(e.target.value)}
                                    placeholder="e.g. Smith Family"
                                    bg="vscode.inputBg"
                                    borderColor="border.default"
                                    color="fg.default"
                                    _hover={{ borderColor: 'vscode.accent' }}
                                    _focus={{
                                        borderColor: 'vscode.accent',
                                        boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)',
                                    }}
                                    disabled={isCreating}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleCreateSubmit();
                                    }}
                                />
                            </Box>
                        </VStack>

                        <HStack
                            justify="flex-end"
                            p={4}
                            gap={3}
                            borderTopWidth={1}
                            borderColor="border.default"
                        >
                            <Button
                                data-testid="create-household-submit-btn"
                                bg="vscode.button"
                                color="white"
                                _hover={{ bg: 'vscode.buttonHover' }}
                                size="sm"
                                onClick={handleCreateSubmit}
                                loading={isCreating}
                                disabled={!newHouseholdName.trim()}
                            >
                                Create
                            </Button>
                            <Button
                                data-testid="create-household-cancel-btn"
                                variant="ghost"
                                bg="button.secondary"
                                color="white"
                                _hover={{ bg: 'button.secondaryHover' }}
                                size="sm"
                                onClick={handleCreateCancel}
                                disabled={isCreating}
                            >
                                Cancel
                            </Button>
                        </HStack>
                    </Box>
                </Box>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* Join Household Dialog                                             */}
            {/* ---------------------------------------------------------------- */}
            {showJoinDialog && (
                <Box
                    data-testid="join-household-dialog"
                    position="fixed"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg="overlay.backdrop"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    zIndex={1200}
                    backdropFilter="blur(4px)"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !isJoining) handleJoinCancel();
                    }}
                >
                    <Box
                        bg="bg.surface"
                        borderRadius="xl"
                        maxW="400px"
                        w="90%"
                        boxShadow="xl"
                        borderWidth={1}
                        borderColor="border.default"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <HStack
                            justify="space-between"
                            p={4}
                            borderBottomWidth={1}
                            borderColor="border.default"
                        >
                            <Heading size="md" color="fg.default">Join Household</Heading>
                            <Button
                                size="xs"
                                variant="ghost"
                                color="fg.muted"
                                _hover={{ color: 'fg.default' }}
                                onClick={handleJoinCancel}
                                disabled={isJoining}
                            >
                                ✕
                            </Button>
                        </HStack>

                        <VStack p={6} align="stretch" gap={4}>
                            <Box>
                                <Text fontSize="sm" fontWeight="medium" mb={2} color="fg.default">
                                    Household ID
                                </Text>
                                <Input
                                    data-testid="join-household-id-input"
                                    value={joinHouseholdId}
                                    onChange={(e) => setJoinHouseholdId(e.target.value)}
                                    placeholder="Enter household ID"
                                    bg="vscode.inputBg"
                                    borderColor="border.default"
                                    color="fg.default"
                                    _hover={{ borderColor: 'vscode.accent' }}
                                    _focus={{
                                        borderColor: 'vscode.accent',
                                        boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)',
                                    }}
                                    disabled={isJoining}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleJoinSubmit();
                                    }}
                                />
                            </Box>
                        </VStack>

                        <HStack
                            justify="flex-end"
                            p={4}
                            gap={3}
                            borderTopWidth={1}
                            borderColor="border.default"
                        >
                            <Button
                                data-testid="join-household-submit-btn"
                                bg="vscode.button"
                                color="white"
                                _hover={{ bg: 'vscode.buttonHover' }}
                                size="sm"
                                onClick={handleJoinSubmit}
                                loading={isJoining}
                                disabled={!joinHouseholdId.trim()}
                            >
                                Join
                            </Button>
                            <Button
                                data-testid="join-household-cancel-btn"
                                variant="ghost"
                                bg="button.secondary"
                                color="white"
                                _hover={{ bg: 'button.secondaryHover' }}
                                size="sm"
                                onClick={handleJoinCancel}
                                disabled={isJoining}
                            >
                                Cancel
                            </Button>
                        </HStack>
                    </Box>
                </Box>
            )}
        </>
    );
};

export default AccountHouseholdSection;
