import {
    Box,
    HStack,
    Text,
    Icon,
    IconButton,
    Skeleton,
} from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useRecipe } from '../../../hooks/useRecipes';
import { RecipeListItem } from '../../../client';

interface RecipeListItemDisplayProps {
    item: RecipeListItem;
    onRemove: (recipeId: string, recipeName: string) => void;
}

const RecipeListItemDisplay = ({ item, onRemove }: RecipeListItemDisplayProps) => {
    const navigate = useNavigate();
    const { data: recipe, isLoading } = useRecipe(item.recipe_id);

    const recipeName = recipe?.core.name || 'Unknown Recipe';

    const handleClick = () => {
        navigate(`/recipes/${item.recipe_id}`, {
            state: {
                backUrl: '/recipe-box',
                backLabel: 'Recipe Box',
                breadcrumbs: [{ label: 'Recipe Box', url: '/recipe-box' }]
            }
        });
    };

    return (
        <Box
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
                    onClick={handleClick}
                >
                    {isLoading ? (
                        <Skeleton height="20px" width="200px" mb={1} />
                    ) : (
                        <Text color="fg.default" fontSize="sm" fontWeight="medium">
                            {recipeName}
                        </Text>
                    )}
                    <HStack gap={2} mt={1}>
                        <Text color="vscode.accent" fontSize="xs">
                            View Recipe
                        </Text>
                        <Text fontSize="xs" color="fg.subtle">
                            Added {new Date(item.added_at).toLocaleDateString()}
                        </Text>
                    </HStack>
                </Box>
                <IconButton
                    aria-label="Remove recipe"
                    size="xs"
                    bg="button.danger"
                    color="white"
                    _hover={{ bg: 'button.dangerHover' }}
                    onClick={() => onRemove(item.recipe_id, recipeName)}
                >
                    <Icon as={FaTrash} />
                </IconButton>
            </HStack>
        </Box>
    );
};

export default RecipeListItemDisplay;
