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
import { useHouseholdContext } from '../../../context/HouseholdContext';
import { useCreateHousehold, useJoinHousehold } from '../../../hooks/useHouseholds';

const STORAGE_KEY = 'household_onboarding_dismissed';

const HouseholdOnboardingPrompt = () => {
    const { households } = useHouseholdContext();
    const { mutate: createHousehold, isPending: isCreating } = useCreateHousehold();
    const { mutate: joinHousehold, isPending: isJoining } = useJoinHousehold();

    const [dismissed, setDismissed] = useState(() => {
        return localStorage.getItem(STORAGE_KEY) === 'true';
    });

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newHouseholdName, setNewHouseholdName] = useState('');

    const [showJoinDialog, setShowJoinDialog] = useState(false);
    const [joinHouseholdId, setJoinHouseholdId] = useState('');

    // Don't show if user already has households or dismissed
    if (households.length > 0 || dismissed) {
        return null;
    }

    const handleDismiss = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setDismissed(true);
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

    return (
        <>
            <Box
                data-testid="household-onboarding-prompt"
                mb={6}
                p={5}
                borderWidth={1}
                borderColor="vscode.accent"
                borderRadius="lg"
                bg="bg.muted"
                boxShadow="md"
            >
                <VStack align="stretch" gap={3}>
                    <Heading size="sm" color="fg.default">
                        Get started with Households
                    </Heading>
                    <Text fontSize="sm" color="fg.muted">
                        Households let you share recipes and meal plans with family or friends.
                        Create your own household or join an existing one to get started.
                    </Text>
                    <HStack gap={3} flexWrap="wrap">
                        <Button
                            data-testid="onboarding-create-btn"
                            size="sm"
                            bg="vscode.button"
                            color="white"
                            _hover={{ bg: 'vscode.buttonHover' }}
                            onClick={() => setShowCreateDialog(true)}
                        >
                            Create a Household
                        </Button>
                        <Button
                            data-testid="onboarding-join-btn"
                            size="sm"
                            variant="outline"
                            borderColor="vscode.accent"
                            color="vscode.accent"
                            _hover={{ bg: 'whiteAlpha.100' }}
                            onClick={() => setShowJoinDialog(true)}
                        >
                            Join a Household
                        </Button>
                        <Button
                            data-testid="onboarding-dismiss-btn"
                            size="sm"
                            variant="ghost"
                            color="fg.muted"
                            _hover={{ color: 'fg.default' }}
                            onClick={handleDismiss}
                        >
                            Maybe Later
                        </Button>
                    </HStack>
                </VStack>
            </Box>

            {/* Create Household Dialog */}
            {showCreateDialog && (
                <Box
                    data-testid="onboarding-create-dialog"
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
                                X
                            </Button>
                        </HStack>

                        <VStack p={6} align="stretch" gap={4}>
                            <Box>
                                <Text fontSize="sm" fontWeight="medium" mb={2} color="fg.default">
                                    Household Name
                                </Text>
                                <Input
                                    data-testid="onboarding-create-name-input"
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
                                data-testid="onboarding-create-submit-btn"
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

            {/* Join Household Dialog */}
            {showJoinDialog && (
                <Box
                    data-testid="onboarding-join-dialog"
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
                                X
                            </Button>
                        </HStack>

                        <VStack p={6} align="stretch" gap={4}>
                            <Box>
                                <Text fontSize="sm" fontWeight="medium" mb={2} color="fg.default">
                                    Household ID
                                </Text>
                                <Input
                                    data-testid="onboarding-join-id-input"
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
                                data-testid="onboarding-join-submit-btn"
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

export default HouseholdOnboardingPrompt;
