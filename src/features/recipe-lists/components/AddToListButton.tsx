import { useState } from 'react';
import {
    Box,
    Button,
    Icon,
    VStack,
    HStack,
    Text,
    Input,
    Textarea,
    Spinner,
} from '@chakra-ui/react';
import { Menu } from '@chakra-ui/react';
import { FaBookmark, FaRegBookmark, FaPlus, FaCheck } from 'react-icons/fa';
import { useRecipeLists, useCreateRecipeList, useAddRecipeToList, useRemoveRecipeFromList } from '../../../hooks/useRecipeLists';
import { useAuth } from '../../../context/AuthContext';
import { toaster } from '../../../toaster';

interface AddToListButtonProps {
    recipeId: string;
}

const AddToListButton = ({ recipeId }: AddToListButtonProps) => {
    const { user } = useAuth();
    const { data: lists, isLoading } = useRecipeLists();
    const createList = useCreateRecipeList();
    const addRecipeToList = useAddRecipeToList();
    const removeRecipeFromList = useRemoveRecipeFromList();

    const [isCreatingNewList, setIsCreatingNewList] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [newListDescription, setNewListDescription] = useState('');

    // Filter lists to show only the current user's lists
    const userLists = lists?.filter(list => list.user_id === user?.id) || [];

    // Check which lists contain this recipe
    const listsWithRecipe = userLists.filter(list =>
        list.items?.some(item => item.recipe_id === recipeId)
    );

    const isRecipeInAnyList = listsWithRecipe.length > 0;

    const handleToggleRecipeInList = async (listId: string, isInList: boolean) => {
        try {
            if (isInList) {
                await removeRecipeFromList.mutateAsync({ listId, recipeId });
                toaster.create({ title: 'Recipe removed from list', type: 'success' });
            } else {
                await addRecipeToList.mutateAsync({ listId, requestBody: { recipe_id: recipeId } });
                toaster.create({ title: 'Recipe added to list', type: 'success' });
            }
        } catch (err) {
            console.error('Failed to update recipe list', err);
            toaster.create({ title: 'Failed to update recipe list', type: 'error' });
        }
    };

    const handleCreateNewList = async () => {
        if (!newListName.trim()) {
            toaster.create({ title: 'Please enter a list name', type: 'error' });
            return;
        }

        try {
            const newList = await createList.mutateAsync({
                name: newListName.trim(),
                description: newListDescription.trim() || undefined,
            });

            // Add the recipe to the newly created list
            await addRecipeToList.mutateAsync({
                listId: newList.id,
                requestBody: { recipe_id: recipeId }
            });

            toaster.create({ title: 'List created and recipe added', type: 'success' });
            setIsCreatingNewList(false);
            setNewListName('');
            setNewListDescription('');
        } catch (err) {
            console.error('Failed to create list', err);
            toaster.create({ title: 'Failed to create list', type: 'error' });
        }
    };

    if (isLoading) {
        return (
            <Button
                bg="vscode.button"
                color="white"
                _hover={{ bg: 'vscode.buttonHover' }}
                size="xs"
                disabled
            >
                <Spinner size="xs" mr={2} />
            </Button>
        );
    }

    return (
        <Menu.Root>
            <Menu.Trigger asChild>
                <Button
                    bg="vscode.button"
                    color="white"
                    _hover={{ bg: 'vscode.buttonHover' }}
                    size="xs"
                >
                    <Icon as={isRecipeInAnyList ? FaBookmark : FaRegBookmark} mr={2} />
                    {isRecipeInAnyList ? 'Saved' : 'Save to List'}
                </Button>
            </Menu.Trigger>
            <Menu.Positioner>
                <Menu.Content minW="300px" maxW="400px" maxH="500px" overflowY="auto" bg="bg.surface" borderColor="border.default" zIndex={1000}>
                    {!isCreatingNewList ? (
                        <>
                            <Box p={3} borderBottomWidth={1} borderColor="border.default">
                                <Text fontSize="sm" fontWeight="bold" color="fg.default">
                                    Save to Recipe List
                                </Text>
                            </Box>

                            {userLists.length === 0 ? (
                                <Box p={4} textAlign="center">
                                    <Text fontSize="sm" color="fg.muted" mb={3}>
                                        You don't have any lists yet.
                                    </Text>
                                </Box>
                            ) : (
                                <Box p={2}>
                                    {userLists.map((list) => {
                                        const isInList = list.items?.some(item => item.recipe_id === recipeId) || false;
                                        return (
                                            <Menu.Item
                                                key={list.id}
                                                value={list.id}
                                                onClick={() => handleToggleRecipeInList(list.id, isInList)}
                                                cursor="pointer"
                                                p={3}
                                                borderRadius="md"
                                                _hover={{ bg: 'bg.muted' }}
                                            >
                                                <HStack justify="space-between" w="100%">
                                                    <Box flex="1">
                                                        <Text fontSize="sm" fontWeight="medium" color="fg.default">
                                                            {list.name}
                                                        </Text>
                                                        {list.description && (
                                                            <Text fontSize="xs" color="fg.muted" lineClamp={1}>
                                                                {list.description}
                                                            </Text>
                                                        )}
                                                        <Text fontSize="xs" color="fg.subtle">
                                                            {list.items?.length || 0} recipes
                                                        </Text>
                                                    </Box>
                                                    {isInList && (
                                                        <Icon as={FaCheck} color="green.400" />
                                                    )}
                                                </HStack>
                                            </Menu.Item>
                                        );
                                    })}
                                </Box>
                            )}

                            <Box p={2} borderTopWidth={1} borderColor="border.default">
                                <Button
                                    w="100%"
                                    size="sm"
                                    bg="vscode.button"
                                    color="white"
                                    _hover={{ bg: 'vscode.buttonHover' }}
                                    onClick={() => setIsCreatingNewList(true)}
                                >
                                    <Icon as={FaPlus} mr={2} /> Create New List
                                </Button>
                            </Box>
                        </>
                    ) : (
                        <Box p={4}>
                            <VStack align="stretch" gap={3}>
                                <Text fontSize="sm" fontWeight="bold" color="fg.default">
                                    Create New List
                                </Text>
                                <Box>
                                    <Text fontSize="xs" mb={1} color="fg.muted">List Name *</Text>
                                    <Input
                                        placeholder="e.g., Favorites"
                                        value={newListName}
                                        onChange={(e) => setNewListName(e.target.value)}
                                        bg="vscode.inputBg"
                                        borderColor="border.default"
                                        color="fg.default"
                                        size="sm"
                                        _hover={{ borderColor: 'vscode.accent' }}
                                        _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                                    />
                                </Box>
                                <Box>
                                    <Text fontSize="xs" mb={1} color="fg.muted">Description (optional)</Text>
                                    <Textarea
                                        placeholder="Add a description"
                                        value={newListDescription}
                                        onChange={(e) => setNewListDescription(e.target.value)}
                                        bg="vscode.inputBg"
                                        borderColor="border.default"
                                        color="fg.default"
                                        size="sm"
                                        rows={2}
                                        _hover={{ borderColor: 'vscode.accent' }}
                                        _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                                    />
                                </Box>
                                <HStack gap={2}>
                                    <Button
                                        onClick={handleCreateNewList}
                                        bg="vscode.button"
                                        color="white"
                                        _hover={{ bg: 'vscode.buttonHover' }}
                                        size="sm"
                                        flex="1"
                                        loading={createList.isPending || addRecipeToList.isPending}
                                    >
                                        Create & Add
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setIsCreatingNewList(false);
                                            setNewListName('');
                                            setNewListDescription('');
                                        }}
                                        bg="vscode.button"
                                        color="white"
                                        _hover={{ bg: 'vscode.buttonHover' }}
                                        size="sm"
                                        flex="1"
                                    >
                                        Cancel
                                    </Button>
                                </HStack>
                            </VStack>
                        </Box>
                    )}
                </Menu.Content>
            </Menu.Positioner>
        </Menu.Root>
    );
};

export default AddToListButton;
