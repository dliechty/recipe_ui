import { useState } from 'react';
import { useParams, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    Button,
    Spinner,
    Center,
    Breadcrumb,
    Icon,
    Grid
} from '@chakra-ui/react';
import { FaChevronRight, FaRegCopy, FaChevronDown, FaChevronUp, FaPlus } from 'react-icons/fa';
import { useMeal, useDeleteMeal } from '../../../hooks/useMeals';
import { useInfiniteRecipes } from '../../../hooks/useRecipes';
import { useUser } from '../../../hooks/useUsers';
import { useAuth } from '../../../context/AuthContext';
import ErrorAlert from '../../../components/common/ErrorAlert';
import { formatDuration } from '../../../utils/formatters';
import { MealStatus } from '../../../client';
import ExpandableRecipeCard from './ExpandableRecipeCard';
import IngredientAggregation from './IngredientAggregation';
import EditableStatusBadge from './EditableStatusBadge';
import EditableClassificationBadge from './EditableClassificationBadge';
import EditableMealName from './EditableMealName';
import EditableMealDate from './EditableMealDate';
import RecipeSelectionModal from './RecipeSelectionModal';

const MealDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const sourceTemplate = location.state?.sourceTemplate as { id: string; name: string } | undefined;
    const fromTemplateList = location.state?.fromTemplateList as boolean | undefined;

    // Fetch meal
    const { data: meal, isLoading, error } = useMeal(id || '');
    const deleteMeal = useDeleteMeal();
    const { user: currentUser } = useAuth();

    // Fetch creator
    const { data: creator } = useUser(meal?.user_id);

    // Fetch recipes
    const recipeIds = meal?.items?.map(item => item.recipe_id) || [];
    const {
        data: recipesData,
        isLoading: isLoadingRecipes,
        error: recipesError
    } = useInfiniteRecipes(
        recipeIds.length || 1,
        { ids: recipeIds },
        { enabled: recipeIds.length > 0 }
    );
    const recipes = recipesData?.pages.flatMap(p => p.recipes) || [];

    const [isDeleting, setIsDeleting] = useState(false);
    const [allExpanded, setAllExpanded] = useState(false);
    const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

    const canEdit = currentUser?.is_admin || (currentUser?.id && meal?.user_id && currentUser.id === meal.user_id);

    if (isLoading) {
        return (
            <Center h="50vh">
                <Spinner size="xl" color="vscode.accent" />
            </Center>
        );
    }

    if (error || !meal) {
        return (
            <Container maxW="container.md" py={8}>
                <ErrorAlert
                    title="Meal not found"
                    description={error?.message || "The requested meal could not be found."}
                />
                <Button mt={4} onClick={() => navigate('/meals')}>Back to Meals</Button>
            </Container>
        );
    }

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this meal?')) {
            setIsDeleting(true);
            try {
                await deleteMeal.mutateAsync(meal.id);
                navigate('/meals');
            } catch (e) {
                console.error("Failed to delete meal", e);
                setIsDeleting(false);
            }
        }
    };

    const getCreatorName = () => {
        if (!creator) return 'Unknown';
        if (creator.first_name && creator.last_name) return `${creator.first_name} ${creator.last_name}`;
        if (creator.first_name) return creator.first_name;
        return creator.email || 'Unknown';
    };

    const totalMinutes = recipes.reduce((sum, r) => sum + (r.times?.total_time_minutes || 0), 0);

    return (
        <Container maxW="container.lg" py={8}>
            <Breadcrumb.Root mb={6} color="fg.muted" fontSize="sm">
                <Breadcrumb.List>
                    {sourceTemplate ? (
                        <>
                            <Breadcrumb.Item>
                                <Breadcrumb.Link asChild color="vscode.accent" _hover={{ textDecoration: 'underline' }}>
                                    <RouterLink to="/meals/templates">Templates</RouterLink>
                                </Breadcrumb.Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Separator>
                                <Icon as={FaChevronRight} color="fg.muted" />
                            </Breadcrumb.Separator>
                            {!fromTemplateList && (
                                <>
                                    <Breadcrumb.Item>
                                        <Breadcrumb.Link asChild color="vscode.accent" _hover={{ textDecoration: 'underline' }}>
                                            <RouterLink to={`/meals/templates/${sourceTemplate.id}`}>
                                                {sourceTemplate.name}
                                            </RouterLink>
                                        </Breadcrumb.Link>
                                    </Breadcrumb.Item>
                                    <Breadcrumb.Separator>
                                        <Icon as={FaChevronRight} color="fg.muted" />
                                    </Breadcrumb.Separator>
                                </>
                            )}
                            <Breadcrumb.Item>
                                <Breadcrumb.CurrentLink color="fg.default">{meal.name || 'Untitled Meal'}</Breadcrumb.CurrentLink>
                            </Breadcrumb.Item>
                        </>
                    ) : (
                        <>
                            <Breadcrumb.Item>
                                <Breadcrumb.Link asChild color="vscode.accent" _hover={{ textDecoration: 'underline' }}>
                                    <RouterLink to="/meals">Meals</RouterLink>
                                </Breadcrumb.Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Separator>
                                <Icon as={FaChevronRight} color="fg.muted" />
                            </Breadcrumb.Separator>
                            <Breadcrumb.Item>
                                <Breadcrumb.CurrentLink color="fg.default">{meal.name || 'Untitled Meal'}</Breadcrumb.CurrentLink>
                            </Breadcrumb.Item>
                        </>
                    )}
                </Breadcrumb.List>
            </Breadcrumb.Root>

            <HStack mb={6} gap={2} className="no-print">
                {currentUser && (
                    <Button
                        onClick={() => {
                            navigate('/meals/new', {
                                state: {
                                    initialData: {
                                        name: `${meal.name} (Copy)`,
                                        status: meal.status,
                                        classification: meal.classification,
                                        date: meal.date,
                                        items: meal.items?.map(item => ({
                                            recipe_id: item.recipe_id
                                        }))
                                    },
                                    sourceMeal: {
                                        id: meal.id,
                                        name: meal.name
                                    }
                                }
                            });
                        }}
                        bg="vscode.button"
                        color="white"
                        _hover={{ bg: "vscode.buttonHover" }}
                        size="xs"
                    >
                        <Icon as={FaRegCopy} /> Duplicate Meal
                    </Button>
                )}
                {canEdit && (
                    <Button
                        onClick={handleDelete}
                        loading={isDeleting}
                        bg="red.600"
                        color="white"
                        _hover={{ bg: "red.700" }}
                        size="xs"
                    >
                        Delete
                    </Button>
                )}
            </HStack>

            <VStack align="stretch" gap={6}>
                <VStack align="start" gap={4}>
                    <EditableMealName
                        mealId={meal.id}
                        initialName={meal.name || 'Untitled Meal'}
                        canEdit={!!canEdit}
                    />

                    {/* Metadata Grid */}
                    <Grid templateColumns="auto 1fr" gap={2} rowGap={2} mb={0}>
                        <Text fontWeight="bold" color="fg.muted" fontSize="sm">Status:</Text>
                        <Box>
                            <EditableStatusBadge mealId={meal.id} status={meal.status || MealStatus.PROPOSED} canEdit={!!canEdit} />
                        </Box>

                        {(meal.classification || canEdit) && (
                            <>
                                <Text fontWeight="bold" color="fg.muted" fontSize="sm">Classification:</Text>
                                <Box>
                                    <Box>
                                        <EditableClassificationBadge mealId={meal.id} classification={meal.classification} canEdit={!!canEdit} />
                                    </Box>
                                </Box>
                            </>
                        )}

                        {(meal.date || canEdit) && (
                            <>
                                <Text fontWeight="bold" color="fg.muted" fontSize="sm">Date:</Text>
                                <Box>
                                    <EditableMealDate mealId={meal.id} date={meal.date} canEdit={!!canEdit} />
                                </Box>
                            </>
                        )}

                        {creator && (
                            <>
                                <Text fontWeight="bold" color="fg.muted" fontSize="sm">Created By:</Text>
                                <Text fontSize="sm">{getCreatorName()}</Text>
                            </>
                        )}

                        {totalMinutes > 0 && (
                            <>
                                <Text fontWeight="bold" color="fg.muted" fontSize="sm">Total Time:</Text>
                                <Text fontSize="sm">{formatDuration(totalMinutes)}</Text>
                            </>
                        )}

                        <Text fontWeight="bold" color="fg.muted" fontSize="sm">Created:</Text>
                        <Text fontSize="sm">{new Date(meal.created_at).toLocaleString()}</Text>

                        <Text fontWeight="bold" color="fg.muted" fontSize="sm">Updated:</Text>
                        <Text fontSize="sm">{new Date(meal.updated_at).toLocaleString()}</Text>
                    </Grid>
                </VStack>

                {/* Shopping List */}
                {!isLoadingRecipes && recipes.length > 0 && (
                    <IngredientAggregation recipes={recipes} />
                )}

                <Box>
                    <HStack justify="space-between" mb={4}>
                        <Heading size="md" color="fg.default">Recipes</Heading>
                        <HStack>
                            {canEdit && (
                                <Button
                                    size="xs"
                                    bg="vscode.button"
                                    color="white"
                                    _hover={{ bg: "vscode.buttonHover" }}
                                    onClick={() => setIsRecipeModalOpen(true)}
                                    mr={2}
                                >
                                    <Icon as={FaPlus} mr={1} /> Select Recipes
                                </Button>
                            )}
                            <Button
                                size="xs"
                                bg="vscode.button"
                                color="white"
                                _hover={{ bg: "vscode.buttonHover" }}
                                onClick={() => setAllExpanded(!allExpanded)}
                            >
                                {allExpanded ? 'Collapse All' : 'Expand All'}
                                <Icon as={allExpanded ? FaChevronUp : FaChevronDown} ml={2} />
                            </Button>
                        </HStack>
                    </HStack>

                    {isLoadingRecipes ? (
                        <Center p={8}>
                            <Spinner color="vscode.accent" />
                        </Center>
                    ) : recipesError ? (
                        <ErrorAlert title="Failed to load recipes" description={recipesError.message} />
                    ) : recipes.length > 0 ? (
                        <VStack align="stretch" gap={4}>
                            {recipes.map((recipe) => (
                                <ExpandableRecipeCard
                                    key={recipe.core.id}
                                    recipe={recipe}
                                    mealName={meal.name || 'Meal'}
                                    defaultExpanded={allExpanded}
                                />
                            ))}
                        </VStack>
                    ) : (
                        <Text color="fg.muted">No recipes in this meal.</Text>
                    )}
                </Box>


            </VStack>

            <RecipeSelectionModal
                isOpen={isRecipeModalOpen}
                onClose={() => setIsRecipeModalOpen(false)}
                mealId={meal.id}
                initialRecipeIds={recipeIds}
            />
        </Container>
    );
};

export default MealDetails;
