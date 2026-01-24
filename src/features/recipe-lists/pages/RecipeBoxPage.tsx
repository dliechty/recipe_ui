import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    Heading,
    VStack,
    HStack,
    Text,
    Icon,
    Spinner,
    Center,
    Input,
    IconButton,
    Textarea,
    Accordion,
} from '@chakra-ui/react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSave } from 'react-icons/fa';
import { useRecipeLists, useCreateRecipeList, useUpdateRecipeList, useDeleteRecipeList, useRemoveRecipeFromList } from '../../../hooks/useRecipeLists';
import { useAuth } from '../../../context/AuthContext';
import { RecipeList } from '../../../client';
import { toaster } from '../../../toaster';
import ErrorAlert from '../../../components/common/ErrorAlert';

const RecipeBoxPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: lists, isLoading, error } = useRecipeLists();
    const createList = useCreateRecipeList();
    const updateList = useUpdateRecipeList();
    const deleteList = useDeleteRecipeList();
    const removeRecipeFromList = useRemoveRecipeFromList();

    const [isCreating, setIsCreating] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [newListDescription, setNewListDescription] = useState('');
    const [editingListId, setEditingListId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<{ name: string; description: string }>({ name: '', description: '' });

    // Filter lists to show only the current user's lists
    const userLists = lists?.filter(list => list.user_id === user?.id) || [];

    const handleCreateList = async () => {
        if (!newListName.trim()) {
            toaster.create({ title: 'Please enter a list name', type: 'error' });
            return;
        }

        try {
            await createList.mutateAsync({
                name: newListName.trim(),
                description: newListDescription.trim() || undefined,
            });
            toaster.create({ title: 'List created successfully', type: 'success' });
            setIsCreating(false);
            setNewListName('');
            setNewListDescription('');
        } catch (err) {
            console.error('Failed to create list', err);
            toaster.create({ title: 'Failed to create list', type: 'error' });
        }
    };

    const handleStartEdit = (list: RecipeList) => {
        setEditingListId(list.id);
        setEditFormData({
            name: list.name,
            description: list.description || '',
        });
    };

    const handleCancelEdit = () => {
        setEditingListId(null);
        setEditFormData({ name: '', description: '' });
    };

    const handleSaveEdit = async (listId: string) => {
        if (!editFormData.name.trim()) {
            toaster.create({ title: 'Please enter a list name', type: 'error' });
            return;
        }

        try {
            await updateList.mutateAsync({
                listId,
                requestBody: {
                    name: editFormData.name.trim(),
                    description: editFormData.description.trim() || undefined,
                },
            });
            toaster.create({ title: 'List updated successfully', type: 'success' });
            setEditingListId(null);
        } catch (err) {
            console.error('Failed to update list', err);
            toaster.create({ title: 'Failed to update list', type: 'error' });
        }
    };

    const handleDeleteList = async (listId: string, listName: string) => {
        if (!confirm(`Are you sure you want to delete "${listName}"?`)) {
            return;
        }

        try {
            await deleteList.mutateAsync(listId);
            toaster.create({ title: 'List deleted successfully', type: 'success' });
        } catch (err) {
            console.error('Failed to delete list', err);
            toaster.create({ title: 'Failed to delete list', type: 'error' });
        }
    };

    const handleRemoveRecipe = async (listId: string, recipeId: string, recipeName: string) => {
        if (!confirm(`Remove "${recipeName}" from this list?`)) {
            return;
        }

        try {
            await removeRecipeFromList.mutateAsync({ listId, recipeId });
            toaster.create({ title: 'Recipe removed from list', type: 'success' });
        } catch (err) {
            console.error('Failed to remove recipe', err);
            toaster.create({ title: 'Failed to remove recipe', type: 'error' });
        }
    };

    if (isLoading) {
        return (
            <Center h="50vh">
                <Spinner size="xl" color="vscode.accent" />
            </Center>
        );
    }

    if (error) {
        return (
            <Container maxW="container.xl" py={8}>
                <ErrorAlert
                    title="Failed to load recipe lists"
                    description={error?.message || 'An unexpected error occurred.'}
                />
            </Container>
        );
    }

    return (
        <Container maxW="container.xl" py={8}>
            <VStack align="stretch" gap={6}>
                <HStack justify="space-between" align="center">
                    <Heading size="xl" color="fg.default">Recipe Box</Heading>
                    <Button
                        onClick={() => setIsCreating(true)}
                        bg="vscode.button"
                        color="white"
                        _hover={{ bg: 'vscode.buttonHover' }}
                        size="sm"
                        disabled={isCreating}
                    >
                        <Icon as={FaPlus} mr={2} /> New List
                    </Button>
                </HStack>

                {isCreating && (
                    <Box
                        p={6}
                        borderWidth={1}
                        borderColor="border.default"
                        borderRadius="lg"
                        bg="bg.surface"
                    >
                        <VStack align="stretch" gap={4}>
                            <Heading size="md" color="fg.default">Create New List</Heading>
                            <Box>
                                <Text fontSize="sm" mb={2} color="fg.muted">List Name *</Text>
                                <Input
                                    placeholder="e.g., Favorites, Weeknight Dinners"
                                    value={newListName}
                                    onChange={(e) => setNewListName(e.target.value)}
                                    bg="vscode.inputBg"
                                    borderColor="border.default"
                                    color="fg.default"
                                    _hover={{ borderColor: 'vscode.accent' }}
                                    _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                                />
                            </Box>
                            <Box>
                                <Text fontSize="sm" mb={2} color="fg.muted">Description (optional)</Text>
                                <Textarea
                                    placeholder="Add a description for this list"
                                    value={newListDescription}
                                    onChange={(e) => setNewListDescription(e.target.value)}
                                    bg="vscode.inputBg"
                                    borderColor="border.default"
                                    color="fg.default"
                                    _hover={{ borderColor: 'vscode.accent' }}
                                    _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                                    rows={3}
                                />
                            </Box>
                            <HStack>
                                <Button
                                    onClick={handleCreateList}
                                    bg="vscode.button"
                                    color="white"
                                    _hover={{ bg: 'vscode.buttonHover' }}
                                    size="sm"
                                    loading={createList.isPending}
                                >
                                    <Icon as={FaSave} mr={2} /> Create
                                </Button>
                                <Button
                                    onClick={() => {
                                        setIsCreating(false);
                                        setNewListName('');
                                        setNewListDescription('');
                                    }}
                                    bg="vscode.button"
                                    color="white"
                                    _hover={{ bg: 'vscode.buttonHover' }}
                                    size="sm"
                                >
                                    <Icon as={FaTimes} mr={2} /> Cancel
                                </Button>
                            </HStack>
                        </VStack>
                    </Box>
                )}

                {userLists.length === 0 ? (
                    <Box
                        p={12}
                        textAlign="center"
                        borderWidth={1}
                        borderColor="border.default"
                        borderRadius="lg"
                        bg="bg.surface"
                    >
                        <Text fontSize="lg" color="fg.muted" mb={4}>
                            You don't have any recipe lists yet.
                        </Text>
                        <Text fontSize="md" color="fg.subtle">
                            Create a list to organize your favorite recipes!
                        </Text>
                    </Box>
                ) : (
                    <Accordion.Root collapsible multiple>
                        {userLists.map((list) => (
                            <Accordion.Item
                                key={list.id}
                                value={list.id}
                                bg="bg.surface"
                                borderWidth={1}
                                borderColor="border.default"
                                borderRadius="lg"
                                mb={4}
                            >
                                {editingListId === list.id ? (
                                    <Box p={4}>
                                        <VStack align="stretch" gap={3}>
                                            <Box>
                                                <Text fontSize="sm" mb={1} color="fg.muted">List Name *</Text>
                                                <Input
                                                    value={editFormData.name}
                                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                                    bg="vscode.inputBg"
                                                    borderColor="border.default"
                                                    color="fg.default"
                                                    _hover={{ borderColor: 'vscode.accent' }}
                                                    _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                                                    size="sm"
                                                />
                                            </Box>
                                            <Box>
                                                <Text fontSize="sm" mb={1} color="fg.muted">Description</Text>
                                                <Textarea
                                                    value={editFormData.description}
                                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                                    bg="vscode.inputBg"
                                                    borderColor="border.default"
                                                    color="fg.default"
                                                    _hover={{ borderColor: 'vscode.accent' }}
                                                    _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                                                    rows={2}
                                                    size="sm"
                                                />
                                            </Box>
                                            <HStack>
                                                <Button
                                                    onClick={() => handleSaveEdit(list.id)}
                                                    bg="vscode.button"
                                                    color="white"
                                                    _hover={{ bg: 'vscode.buttonHover' }}
                                                    size="xs"
                                                    loading={updateList.isPending}
                                                >
                                                    <Icon as={FaSave} mr={1} /> Save
                                                </Button>
                                                <Button
                                                    onClick={handleCancelEdit}
                                                    bg="vscode.button"
                                                    color="white"
                                                    _hover={{ bg: 'vscode.buttonHover' }}
                                                    size="xs"
                                                >
                                                    <Icon as={FaTimes} mr={1} /> Cancel
                                                </Button>
                                            </HStack>
                                        </VStack>
                                    </Box>
                                ) : (
                                    <Accordion.ItemTrigger p={4} cursor="pointer" _hover={{ bg: 'bg.muted' }}>
                                        <HStack justify="space-between" align="start" flex="1">
                                            <VStack align="stretch" gap={1} flex="1">
                                                <Heading size="md" color="fg.default">{list.name}</Heading>
                                                {list.description && (
                                                    <Text fontSize="sm" color="fg.muted">{list.description}</Text>
                                                )}
                                                <HStack gap={4} fontSize="sm" color="fg.subtle">
                                                    <Text>{list.items?.length || 0} recipes</Text>
                                                    <Text>•</Text>
                                                    <Text>Created {new Date(list.created_at).toLocaleDateString()}</Text>
                                                </HStack>
                                            </VStack>
                                            <HStack gap={2} onClick={(e) => e.stopPropagation()}>
                                                <IconButton
                                                    aria-label="Edit list"
                                                    size="xs"
                                                    variant="ghost"
                                                    color="vscode.accent"
                                                    onClick={() => handleStartEdit(list)}
                                                >
                                                    <Icon as={FaEdit} />
                                                </IconButton>
                                                <IconButton
                                                    aria-label="Delete list"
                                                    size="xs"
                                                    variant="ghost"
                                                    color="red.400"
                                                    onClick={() => handleDeleteList(list.id, list.name)}
                                                    loading={deleteList.isPending}
                                                >
                                                    <Icon as={FaTrash} />
                                                </IconButton>
                                            </HStack>
                                        </HStack>
                                        <Accordion.ItemIndicator />
                                    </Accordion.ItemTrigger>
                                )}
                                <Accordion.ItemContent p={4} pt={0}>
                                    {list.items && list.items.length > 0 ? (
                                        <VStack align="stretch" gap={2}>
                                            {list.items.map((item) => (
                                                <Box
                                                    key={item.id}
                                                    p={3}
                                                    borderWidth={1}
                                                    borderColor="border.default"
                                                    borderRadius="md"
                                                    bg="bg.canvas"
                                                    _hover={{ bg: 'bg.muted' }}
                                                >
                                                    <HStack justify="space-between">
                                                        <Box
                                                            flex="1"
                                                            cursor="pointer"
                                                            onClick={() => navigate(`/recipes/${item.recipe_id}`)}
                                                        >
                                                            <Text color="vscode.accent" fontSize="sm">
                                                                View Recipe →
                                                            </Text>
                                                            <Text fontSize="xs" color="fg.subtle" mt={1}>
                                                                Added {new Date(item.added_at).toLocaleDateString()}
                                                            </Text>
                                                        </Box>
                                                        <IconButton
                                                            aria-label="Remove recipe"
                                                            size="xs"
                                                            variant="ghost"
                                                            color="red.400"
                                                            onClick={() => handleRemoveRecipe(list.id, item.recipe_id, 'this recipe')}
                                                        >
                                                            <Icon as={FaTrash} />
                                                        </IconButton>
                                                    </HStack>
                                                </Box>
                                            ))}
                                        </VStack>
                                    ) : (
                                        <Text fontSize="sm" color="fg.muted" textAlign="center" py={4}>
                                            No recipes in this list yet. Add recipes from the recipe details page.
                                        </Text>
                                    )}
                                </Accordion.ItemContent>
                            </Accordion.Item>
                        ))}
                    </Accordion.Root>
                )}
            </VStack>
        </Container>
    );
};

export default RecipeBoxPage;
