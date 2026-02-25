import { useState } from 'react';
import {
    Box,
    Button,
    Drawer,
    Heading,
    HStack,
    Icon,
    Input,
    Switch,
    Text,
    VStack,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FiHome, FiUser } from 'react-icons/fi';
import { useHouseholdContext } from '../../../context/HouseholdContext';
import { useSetPrimaryHousehold, useCreateHousehold } from '../../../hooks/useHouseholds';

interface HouseholdDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const HouseholdDrawer = ({ isOpen, onClose }: HouseholdDrawerProps) => {
    const {
        activeHouseholdId,
        setActiveHousehold,
        primaryHouseholdId,
        households,
    } = useHouseholdContext();

    const { mutate: setPrimary } = useSetPrimaryHousehold();
    const { mutate: createHousehold, isPending: isCreating } = useCreateHousehold();

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newHouseholdName, setNewHouseholdName] = useState('');

    const activeHousehold = households.find(h => h.id === activeHouseholdId) ?? null;

    const handleSwitchToHousehold = (id: string) => {
        setActiveHousehold(id);
    };

    const handleSwitchToPersonal = () => {
        setActiveHousehold(null);
    };

    const handleTogglePrimary = (householdId: string) => {
        if (primaryHouseholdId === householdId) {
            // Already primary — clear it
            setPrimary({ household_id: null });
        } else {
            setPrimary({ household_id: householdId });
        }
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

    const handleCreateDialogClose = () => {
        setNewHouseholdName('');
        setShowCreateDialog(false);
    };

    return (
        <>
            <Drawer.Root open={isOpen} onOpenChange={(e) => { if (!e.open) onClose(); }} placement="end">
                <Drawer.Backdrop />
                <Drawer.Positioner>
                    <Drawer.Content bg="bg.surface" color="fg.default" borderLeftWidth={1} borderColor="border.default">
                        <Drawer.Header borderBottomWidth={1} borderColor="border.default" p={4}>
                            <HStack justify="space-between" align="center">
                                <Drawer.Title>
                                    <HStack gap={2}>
                                        <Icon as={FiHome} />
                                        <Text fontWeight="bold">Households</Text>
                                    </HStack>
                                </Drawer.Title>
                                <Drawer.CloseTrigger asChild>
                                    <Button
                                        size="xs"
                                        variant="ghost"
                                        color="fg.muted"
                                        _hover={{ color: 'fg.default' }}
                                        aria-label="Close drawer"
                                    >
                                        ✕
                                    </Button>
                                </Drawer.CloseTrigger>
                            </HStack>
                        </Drawer.Header>

                        <Drawer.Body p={4}>
                            <VStack align="stretch" gap={4}>
                                {/* Active household indicator */}
                                <Box
                                    data-testid="active-household-indicator"
                                    bg="bg.muted"
                                    borderRadius="md"
                                    px={3}
                                    py={2}
                                    borderWidth={1}
                                    borderColor="border.default"
                                >
                                    <Text fontSize="xs" color="fg.muted" mb={1}>Currently viewing</Text>
                                    <HStack gap={2}>
                                        <Icon as={activeHousehold ? FiHome : FiUser} color="vscode.accent" />
                                        <Text fontWeight="semibold" color="fg.default">
                                            {activeHousehold ? activeHousehold.name : 'Personal'}
                                        </Text>
                                    </HStack>
                                </Box>

                                {/* Household list */}
                                <Box>
                                    <Heading size="xs" color="fg.muted" mb={2} textTransform="uppercase" letterSpacing="wider">
                                        Your Households
                                    </Heading>
                                    <VStack align="stretch" gap={2}>
                                        {/* Personal option */}
                                        <Box
                                            data-testid="personal-option"
                                            data-active={activeHouseholdId === null ? 'true' : 'false'}
                                            bg={activeHouseholdId === null ? 'whiteAlpha.200' : 'transparent'}
                                            borderRadius="md"
                                            px={3}
                                            py={2}
                                            borderWidth={1}
                                            borderColor={activeHouseholdId === null ? 'vscode.accent' : 'border.default'}
                                            cursor="pointer"
                                            _hover={{ bg: 'whiteAlpha.100' }}
                                            onClick={handleSwitchToPersonal}
                                        >
                                            <HStack justify="space-between" align="center">
                                                <HStack gap={2}>
                                                    <Icon as={FiUser} color={activeHouseholdId === null ? 'vscode.accent' : 'fg.muted'} />
                                                    <Text
                                                        fontWeight={activeHouseholdId === null ? 'bold' : 'medium'}
                                                        color={activeHouseholdId === null ? 'fg.default' : 'fg.muted'}
                                                    >
                                                        Personal
                                                    </Text>
                                                </HStack>
                                                {activeHouseholdId === null && (
                                                    <Text fontSize="xs" color="vscode.accent" fontWeight="bold">Active</Text>
                                                )}
                                            </HStack>
                                        </Box>

                                        {/* Household rows */}
                                        {households.map((household) => {
                                            const isActive = activeHouseholdId === household.id;
                                            const isPrimary = primaryHouseholdId === household.id;
                                            return (
                                                <Box
                                                    key={household.id}
                                                    data-testid={`household-row-${household.id}`}
                                                    data-active={isActive ? 'true' : 'false'}
                                                    bg={isActive ? 'whiteAlpha.200' : 'transparent'}
                                                    borderRadius="md"
                                                    px={3}
                                                    py={2}
                                                    borderWidth={1}
                                                    borderColor={isActive ? 'vscode.accent' : 'border.default'}
                                                >
                                                    <VStack align="stretch" gap={2}>
                                                        <HStack justify="space-between" align="center">
                                                            <HStack gap={2}>
                                                                <Icon as={FiHome} color={isActive ? 'vscode.accent' : 'fg.muted'} />
                                                                <Text
                                                                    fontWeight={isActive ? 'bold' : 'medium'}
                                                                    color={isActive ? 'fg.default' : 'fg.default'}
                                                                >
                                                                    {household.name}
                                                                </Text>
                                                                {isPrimary && (
                                                                    <Text fontSize="xs" color="yellow.400" fontWeight="bold">Primary</Text>
                                                                )}
                                                            </HStack>
                                                            {!isActive && (
                                                                <Button
                                                                    data-testid={`switch-btn-${household.id}`}
                                                                    size="xs"
                                                                    variant="outline"
                                                                    colorPalette="blue"
                                                                    borderColor="vscode.accent"
                                                                    color="vscode.accent"
                                                                    _hover={{ bg: 'whiteAlpha.100' }}
                                                                    onClick={() => handleSwitchToHousehold(household.id)}
                                                                >
                                                                    Switch
                                                                </Button>
                                                            )}
                                                            {isActive && (
                                                                <Text fontSize="xs" color="vscode.accent" fontWeight="bold">Active</Text>
                                                            )}
                                                        </HStack>

                                                        {/* Set as Primary toggle */}
                                                        <HStack justify="space-between" align="center">
                                                            <Text fontSize="xs" color="fg.muted">Set as Primary</Text>
                                                            <Box
                                                                data-testid={`primary-toggle-${household.id}`}
                                                                display="inline-flex"
                                                                alignItems="center"
                                                                cursor="pointer"
                                                                onClick={() => handleTogglePrimary(household.id)}
                                                            >
                                                                <Switch.Root
                                                                    checked={isPrimary}
                                                                    onCheckedChange={() => handleTogglePrimary(household.id)}
                                                                    size="sm"
                                                                >
                                                                    <Switch.HiddenInput />
                                                                    <Switch.Control
                                                                        bg={isPrimary ? 'yellow.500' : 'vscode.secondaryButton'}
                                                                        _checked={{ bg: 'yellow.500' }}
                                                                    >
                                                                        <Switch.Thumb bg="white" />
                                                                    </Switch.Control>
                                                                </Switch.Root>
                                                            </Box>
                                                        </HStack>
                                                    </VStack>
                                                </Box>
                                            );
                                        })}
                                    </VStack>
                                </Box>

                                {/* Quick actions */}
                                <Box borderTopWidth={1} borderColor="border.default" pt={4}>
                                    <Heading size="xs" color="fg.muted" mb={3} textTransform="uppercase" letterSpacing="wider">
                                        Actions
                                    </Heading>
                                    <VStack align="stretch" gap={2}>
                                        <Button
                                            size="sm"
                                            bg="vscode.button"
                                            color="white"
                                            _hover={{ bg: 'vscode.buttonHover' }}
                                            onClick={() => setShowCreateDialog(true)}
                                        >
                                            Create Household
                                        </Button>
                                        <Text
                                            as={Link}
                                            // @ts-expect-error - 'to' is passed to Link but Text types don't know it
                                            to="/account"
                                            display="block"
                                            textAlign="center"
                                            fontSize="sm"
                                            color="vscode.accent"
                                            _hover={{ textDecoration: 'underline' }}
                                            py={1}
                                            role="link"
                                        >
                                            Manage Households
                                        </Text>
                                    </VStack>
                                </Box>
                            </VStack>
                        </Drawer.Body>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Drawer.Root>

            {/* Create Household Dialog */}
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
                        if (e.target === e.currentTarget && !isCreating) {
                            handleCreateDialogClose();
                        }
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
                                onClick={handleCreateDialogClose}
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
                                    value={newHouseholdName}
                                    onChange={(e) => setNewHouseholdName(e.target.value)}
                                    placeholder="e.g. Smith Family"
                                    bg="vscode.inputBg"
                                    borderColor="border.default"
                                    color="fg.default"
                                    _hover={{ borderColor: 'vscode.accent' }}
                                    _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
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
                                onClick={handleCreateDialogClose}
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

export default HouseholdDrawer;
