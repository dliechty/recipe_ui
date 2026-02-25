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
import {
    useHouseholds,
    useHouseholdMembers,
    useCreateHousehold,
    useUpdateHousehold,
    useDeleteHousehold,
    useRemoveHouseholdMember,
} from '../../../hooks/useHouseholds';
import { Household, HouseholdMember } from '../../../client';

// ---------------------------------------------------------------------------
// Sub-component: member list
// ---------------------------------------------------------------------------

const AdminMemberList = ({
    household,
}: {
    household: Household;
}) => {
    const { data: members = [] } = useHouseholdMembers(household.id);
    const { mutate: removeMember } = useRemoveHouseholdMember();

    return (
        <Box data-testid={`member-list-${household.id}`} mt={3} pl={4}>
            <Text fontSize="xs" color="fg.muted" mb={2} textTransform="uppercase" letterSpacing="wider">
                Members
            </Text>
            <VStack align="stretch" gap={1}>
                {members.map((member: HouseholdMember) => {
                    const displayName =
                        member.user.first_name || member.user.last_name
                            ? `${member.user.first_name ?? ''} ${member.user.last_name ?? ''}`.trim()
                            : member.user.email;
                    return (
                        <HStack key={member.user_id} justify="space-between" align="center">
                            <Text fontSize="sm" color="fg.default">
                                {displayName}
                            </Text>
                            <Button
                                data-testid={`remove-member-btn-${household.id}-${member.user_id}`}
                                size="2xs"
                                variant="outline"
                                colorPalette="red"
                                borderColor="red.500"
                                color="red.400"
                                _hover={{ bg: 'red.900' }}
                                onClick={() => removeMember({ householdId: household.id, userId: member.user_id })}
                            >
                                Remove
                            </Button>
                        </HStack>
                    );
                })}
            </VStack>
        </Box>
    );
};

// ---------------------------------------------------------------------------
// Sub-component: single household row
// ---------------------------------------------------------------------------

interface AdminHouseholdRowProps {
    household: Household;
    onDelete: (id: string) => void;
    onRename: (id: string, name: string) => void;
}

const AdminHouseholdRow = ({ household, onDelete, onRename }: AdminHouseholdRowProps) => {
    const { data: members = [] } = useHouseholdMembers(household.id);
    const [showMembers, setShowMembers] = useState(false);
    const [renameValue, setRenameValue] = useState(household.name);

    const creator = members.find((m) => m.user_id === household.created_by);
    const creatorName = creator
        ? (
            creator.user.first_name || creator.user.last_name
                ? `${creator.user.first_name ?? ''} ${creator.user.last_name ?? ''}`.trim()
                : creator.user.email
        )
        : household.created_by;

    const createdDate = new Date(household.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

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
            {/* Header: name + meta */}
            <HStack justify="space-between" align="start" mb={3}>
                <VStack align="stretch" gap={1} flex={1}>
                    <Text fontWeight="bold" color="fg.default" fontSize="md">
                        {household.name}
                    </Text>
                    <HStack gap={4} flexWrap="wrap">
                        <Text fontSize="xs" color="fg.muted">
                            Creator: {creatorName}
                        </Text>
                        <Text fontSize="xs" color="fg.muted">
                            {members.length} member{members.length !== 1 ? 's' : ''}
                        </Text>
                        <Text fontSize="xs" color="fg.muted">
                            Created: {createdDate}
                        </Text>
                    </HStack>
                </VStack>
            </HStack>

            {/* Rename */}
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

            {/* Actions */}
            <HStack gap={2} flexWrap="wrap">
                <Button
                    data-testid={`view-members-btn-${household.id}`}
                    size="xs"
                    variant="outline"
                    borderColor="border.default"
                    color="fg.muted"
                    _hover={{ bg: 'whiteAlpha.100' }}
                    onClick={() => setShowMembers((prev) => !prev)}
                >
                    {showMembers ? 'Hide Members' : 'View Members'}
                </Button>

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
            </HStack>

            {/* Expanded member list */}
            {showMembers && (
                <AdminMemberList household={household} />
            )}
        </Box>
    );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const AdminHouseholdManagement = () => {
    const { data: households = [] } = useHouseholds();
    const { mutate: createHousehold, isPending: isCreating } = useCreateHousehold();
    const { mutate: updateHousehold } = useUpdateHousehold();
    const { mutate: deleteHousehold } = useDeleteHousehold();

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newHouseholdName, setNewHouseholdName] = useState('');
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    const handleRename = (id: string, name: string) => {
        updateHousehold({ id, requestBody: { name } });
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

    return (
        <>
            <Box>
                <HStack justify="space-between" align="center" mb={4}>
                    <Heading size="md" color="fg.default">
                        All Households
                    </Heading>
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
                </HStack>

                {households.length === 0 ? (
                    <Box py={6} textAlign="center">
                        <Text color="fg.muted">No households found.</Text>
                    </Box>
                ) : (
                    <VStack align="stretch" gap={4}>
                        {households.map((household: Household) => (
                            <AdminHouseholdRow
                                key={household.id}
                                household={household}
                                onDelete={handleDeleteClick}
                                onRename={handleRename}
                            />
                        ))}
                    </VStack>
                )}
            </Box>

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
                                Are you sure you want to permanently delete this household? Meals linked to this household will be unlinked. This action cannot be undone.
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
        </>
    );
};

export default AdminHouseholdManagement;
