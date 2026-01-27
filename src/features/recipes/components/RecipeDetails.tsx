import React from 'react';
import { useParams, useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
    Box,
    Container,
    Heading,
    Text,
    Spinner,
    Center,
    VStack,
    HStack,
    Badge,
    Button,
    List,
    Icon,
    Grid,
    GridItem,
    Link,
    Breadcrumb,
    Switch
} from '@chakra-ui/react';
import { FaCheckCircle, FaEdit, FaChevronRight, FaRegCopy, FaRegSquare, FaTrash } from 'react-icons/fa';
import { useRecipe, useDeleteRecipe } from '../../../hooks/useRecipes';
import { useUser } from '../../../hooks/useUsers';
import { useAuth } from '../../../context/AuthContext';
import ErrorAlert from '../../../components/common/ErrorAlert';
import { formatQuantity, formatDuration, formatDietName } from '../../../utils/formatters';
import CommentList from './comments/CommentList';
import { UnitSystem } from '../../../client';
import AddToListButton from '../../recipe-lists/components/AddToListButton';


const RecipeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const backUrl = location.state?.backUrl || (location.state?.fromSearch ? `/recipes?${location.state.fromSearch}` : '/recipes');
    const backLabel = location.state?.backLabel || 'Recipes';
    const [scale, setScale] = React.useState<number>(1.0);
    const [unitSystem, setUnitSystem] = React.useState<UnitSystem | null>(null);
    const { data: recipe, isLoading: loading, error } = useRecipe(id || '', scale, unitSystem);
    const deleteRecipe = useDeleteRecipe();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

    React.useEffect(() => {
        setScale(1.0);
        setUnitSystem(null);
    }, [id]);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isDeleteDialogOpen) {
                setIsDeleteDialogOpen(false);
            }
        };
        if (isDeleteDialogOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDeleteDialogOpen]);

    const { data: parentRecipe } = useRecipe(recipe?.parent_recipe_id || '');
    const { data: user } = useUser(recipe?.core.owner_id);
    const { user: currentUser } = useAuth();

    if (error) {
        return (
            <Container maxW="container.xl" py={8}>
                <ErrorAlert title="Failed to load recipe" description={error.message || "An unexpected error occurred."} />
                <Button mt={4} onClick={() => navigate(backUrl)}>Back to {backLabel}</Button>
            </Container>
        );
    }

    if (loading) {
        return (
            <Center h="50vh">
                <Spinner size="xl" color="vscode.accent" />
            </Center>
        );
    }

    if (!recipe) {
        return (
            <Container maxW="container.md" py={8}>
                <Text>Recipe not found.</Text>
                <Button
                    mt={4}
                    onClick={() => navigate(backUrl)}
                    bg="vscode.button"
                    color="white"
                    _hover={{ bg: "vscode.buttonHover" }}
                >
                    Back to {backLabel}
                </Button>
            </Container>
        );
    }

    const getUserDisplayName = () => {
        if (!user) return null;
        if (user.first_name && user.last_name) {
            return `${user.first_name} ${user.last_name}`;
        }
        if (user.first_name) {
            return user.first_name;
        }
        return user.email;
    };

    const userDisplayName = getUserDisplayName();
    const canEdit = currentUser?.is_admin || (currentUser?.id && recipe?.core.owner_id && currentUser.id === recipe.core.owner_id);

    return (
        <Container maxW="container.xl" pt={2} pb={8}>
            <Breadcrumb.Root mb={6} color="fg.muted" fontSize="sm" className="no-print">
                <Breadcrumb.List>
                    {(() => {
                        const crumbs = location.state?.breadcrumbs || [
                            { label: backLabel, url: backUrl }
                        ];

                        return crumbs.map((crumb: { label: string, url: string }, index: number) => (
                            <React.Fragment key={index}>
                                <Breadcrumb.Item>
                                    <Breadcrumb.Link asChild color="vscode.accent" _hover={{ textDecoration: 'underline' }}>
                                        <RouterLink to={crumb.url}>{crumb.label}</RouterLink>
                                    </Breadcrumb.Link>
                                </Breadcrumb.Item>
                                <Breadcrumb.Separator>
                                    <Icon as={FaChevronRight} color="fg.muted" />
                                </Breadcrumb.Separator>
                            </React.Fragment>
                        ));
                    })()}
                    <Breadcrumb.Item>
                        <Breadcrumb.CurrentLink color="fg.default">{recipe.core.name}</Breadcrumb.CurrentLink>
                    </Breadcrumb.Item>
                </Breadcrumb.List>
            </Breadcrumb.Root>

            <HStack mb={6} className="no-print">
                {(canEdit || currentUser) && (
                    <HStack gap={2}>
                        {currentUser && (
                            <Button
                                onClick={() => {
                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                    const { audit, ...rest } = recipe;
                                    const id = recipe.core.id;
                                    navigate('/recipes/new', {
                                        state: {
                                            initialData: {
                                                ...rest,
                                                parent_recipe_id: id
                                            },
                                            parentName: recipe.core.name
                                        }
                                    });
                                }}
                                bg="vscode.button"
                                color="white"
                                _hover={{ bg: "vscode.buttonHover" }}
                                size="xs"
                            >
                                <Icon as={FaRegCopy} /> Create Variant
                            </Button>
                        )}
                        {currentUser && id && (
                            <AddToListButton recipeId={id} />
                        )}
                        {canEdit && (
                            <Button
                                onClick={() => navigate(`/recipes/${id}/edit`)}
                                bg="vscode.button"
                                color="white"
                                _hover={{ bg: "vscode.buttonHover" }}
                                size="xs"
                            >
                                <Icon as={FaEdit} /> Edit Recipe
                            </Button>
                        )}
                        {canEdit && (
                            <>
                                <Button
                                    bg="button.danger"
                                    color="white"
                                    _hover={{ bg: "button.dangerHover" }}
                                    disabled={recipe.variant_recipe_ids && recipe.variant_recipe_ids.length > 0}
                                    title={recipe.variant_recipe_ids && recipe.variant_recipe_ids.length > 0 ? "Cannot delete recipe with variants" : "Delete Recipe"}
                                    onClick={() => !(recipe.variant_recipe_ids && recipe.variant_recipe_ids.length > 0) && setIsDeleteDialogOpen(true)}
                                    opacity={recipe.variant_recipe_ids && recipe.variant_recipe_ids.length > 0 ? 0.5 : 1}
                                    cursor={recipe.variant_recipe_ids && recipe.variant_recipe_ids.length > 0 ? "not-allowed" : "pointer"}
                                    size="xs"
                                >
                                    <Icon as={FaTrash} /> Delete
                                </Button>

                                {isDeleteDialogOpen && (
                                    <Box
                                        position="fixed"
                                        top="0"
                                        left="0"
                                        right="0"
                                        bottom="0"
                                        bg="overlay.backdrop"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        zIndex={1400}
                                        backdropFilter="blur(2px)"
                                        onClick={() => setIsDeleteDialogOpen(false)}
                                    >
                                        <Box
                                            bg="bg.surface"
                                            p={6}
                                            borderRadius="md"
                                            boxShadow="xl"
                                            borderWidth="1px"
                                            borderColor="border.default"
                                            onClick={(e) => e.stopPropagation()}
                                            minW="300px"
                                            maxW="500px"
                                        >
                                            <Heading size="md" mb={4} color="fg.default">Delete Recipe</Heading>
                                            <Text mb={6} color="fg.muted">
                                                Are you sure you want to delete this recipe? This action cannot be undone.
                                            </Text>
                                            <HStack justify="flex-end" gap={3}>
                                                <Button
                                                    onClick={() => setIsDeleteDialogOpen(false)}
                                                    bg="button.secondary"
                                                    color="white"
                                                    _hover={{ bg: "button.secondaryHover" }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    data-testid="confirm-delete-btn"
                                                    bg="button.danger"
                                                    color="white"
                                                    _hover={{ bg: "button.dangerHover" }}
                                                    onClick={() => {
                                                        if (id) {
                                                            deleteRecipe.mutate(id, {
                                                                onSuccess: () => {
                                                                    setIsDeleteDialogOpen(false);
                                                                    navigate('/recipes');
                                                                }
                                                            });
                                                        }
                                                    }}
                                                    loading={deleteRecipe.isPending}
                                                >
                                                    Delete
                                                </Button>
                                            </HStack>
                                        </Box>
                                    </Box>
                                )}
                            </>
                        )}
                    </HStack>
                )}
            </HStack>



            <Box bg="bg.surface" p={8} borderRadius="lg" boxShadow="md" borderWidth={1} borderColor="border.default" className="no-print-border" position="relative">
                <HStack position="absolute" top={4} right={4} gap={2} className="no-print">
                    <Text color="fg.muted" fontSize="xs">
                        Recipe Id: {recipe.core.id}
                    </Text>
                    <Button
                        size="xs"
                        variant="ghost"
                        color="fg.muted"
                        minW="auto"
                        px={1}
                        height="auto"
                        _hover={{ color: "vscode.accent", bg: "vscode.inputBg" }}
                        onClick={() => navigator.clipboard.writeText(recipe.core.id)}
                        aria-label="Copy Recipe ID"
                        title="Copy Recipe ID"
                    >
                        <Icon as={FaRegCopy} boxSize={3} />
                    </Button>
                </HStack>
                <Grid className="print-two-columns" templateColumns={{ base: "1fr", md: "1fr 2fr" }} gap={8}>
                    {/* Left Column: Basic Info + Ingredients */}
                    <GridItem>
                        <VStack align="start" gap={8}>
                            {/* Basic Info Section (Moved from top) */}
                            <Box w="full">
                                <Heading mb={2} color="fg.default">{recipe.core.name}</Heading>

                                {userDisplayName && (
                                    <Text color="fg.muted" mb={2} fontSize="sm">
                                        Added By: {userDisplayName}
                                    </Text>
                                )}

                                {recipe.audit?.updated_at && (
                                    <Text color="fg.muted" mb={2} fontSize="sm">
                                        Last Updated: {new Date(recipe.audit.updated_at).toLocaleDateString()}
                                    </Text>
                                )}

                                {recipe.core.source && (
                                    <Text color="fg.muted" mb={4} fontSize="sm">
                                        Source: {recipe.core.source_url ? (
                                            <Link href={recipe.core.source_url} target="_blank" rel="noopener noreferrer" color="blue.500" textDecoration="underline">
                                                {recipe.core.source}
                                            </Link>
                                        ) : (
                                            recipe.core.source
                                        )}
                                    </Text>

                                )}


                                {(recipe.parent_recipe_id && parentRecipe) || (recipe.variant_recipe_ids && recipe.variant_recipe_ids.length > 0) ? (
                                    <Text color="fg.muted" mb={4} fontSize="sm">
                                        {recipe.parent_recipe_id && parentRecipe && (
                                            <>
                                                Parent: <RouterLink to={`/recipes/${recipe.parent_recipe_id}`}><Link as="span" color="vscode.accent" textDecoration="underline">{parentRecipe.core.name}</Link></RouterLink>
                                            </>
                                        )}
                                        {recipe.parent_recipe_id && parentRecipe && recipe.variant_recipe_ids && recipe.variant_recipe_ids.length > 0 && (
                                            <Text as="span" mx={2}>|</Text>
                                        )}
                                        {recipe.variant_recipe_ids && recipe.variant_recipe_ids.length > 0 && (
                                            <>
                                                Variants: <RouterLink to={recipe.variant_recipe_ids.length === 1 ? `/recipes/${recipe.variant_recipe_ids[0]}` : `/recipes?ids=${[recipe.core.id, ...recipe.variant_recipe_ids].join(',')}`}><Link as="span" color="vscode.accent" textDecoration="underline">({recipe.variant_recipe_ids.length})</Link></RouterLink>
                                            </>
                                        )}
                                    </Text>
                                ) : null}

                                <HStack gap={2} mb={6}>
                                    {recipe.core.difficulty && (
                                        <Badge colorPalette={recipe.core.difficulty === 'Easy' ? 'green' : recipe.core.difficulty === 'Medium' ? 'yellow' : 'red'}>
                                            {recipe.core.difficulty}
                                        </Badge>
                                    )}
                                    {recipe.core.cuisine && <Badge colorPalette="purple">{recipe.core.cuisine}</Badge>}
                                    {recipe.core.category && <Badge colorPalette="orange">{recipe.core.category}</Badge>}
                                    {recipe.core.protein && <Badge colorPalette="blue">{recipe.core.protein}</Badge>}
                                    {(recipe.suitable_for_diet || []).map(diet => (
                                        <Badge key={diet} colorPalette="teal">{formatDietName(diet)}</Badge>
                                    ))}
                                </HStack>

                                <Grid templateColumns="auto 1fr" gap={2} rowGap={1}>
                                    {(recipe.times.total_time_minutes ?? 0) > 0 && (
                                        <>
                                            <Text fontWeight="bold" color="fg.muted" fontSize="sm">Total Time:</Text>
                                            <Text fontSize="sm">{formatDuration(recipe.times.total_time_minutes)}</Text>
                                        </>
                                    )}

                                    {(recipe.times.prep_time_minutes ?? 0) > 0 && (
                                        <>
                                            <Text fontWeight="bold" color="fg.muted" fontSize="sm" pl={2}>Prep Time:</Text>
                                            <Text fontSize="sm">{formatDuration(recipe.times.prep_time_minutes)}</Text>
                                        </>
                                    )}

                                    {(recipe.times.active_time_minutes ?? 0) > 0 && (
                                        <>
                                            <Text fontWeight="bold" color="fg.muted" fontSize="sm" pl={2}>Active Time:</Text>
                                            <Text fontSize="sm">{formatDuration(recipe.times.active_time_minutes)}</Text>
                                        </>
                                    )}

                                    {(recipe.times.cook_time_minutes ?? 0) > 0 && (
                                        <>
                                            <Text fontWeight="bold" color="fg.muted" fontSize="sm" pl={2}>Cooking Time:</Text>
                                            <Text fontSize="sm">{formatDuration(recipe.times.cook_time_minutes)}</Text>
                                        </>
                                    )}

                                    <Text fontWeight="bold" color="fg.muted" fontSize="sm" mt={4}>Yield:</Text>
                                    <Text fontSize="sm" mt={4}>{recipe.core.yield_amount} {recipe.core.yield_unit}</Text>

                                    {recipe.nutrition?.serving_size && (
                                        <>
                                            <Text fontWeight="bold" color="fg.muted" fontSize="sm">Serving Size:</Text>
                                            <Text fontSize="sm">{recipe.nutrition.serving_size}</Text>
                                        </>
                                    )}

                                    {(recipe.nutrition?.calories ?? 0) > 0 && (
                                        <>
                                            <Text fontWeight="bold" color="fg.muted" fontSize="sm">Calories:</Text>
                                            <Text fontSize="sm">{recipe.nutrition?.calories} kcal</Text>
                                        </>
                                    )}
                                </Grid>
                            </Box>

                            {/* Description Section (Mobile & Print) - Above Ingredients */}
                            <Text className="no-print" display={{ base: 'block', md: 'none' }} mb={4} color="fg.muted">
                                {recipe.core.description}
                            </Text>

                            {/* Ingredients Section */}
                            <Box w="fit-content" mx="0">
                                <HStack mb={4} gap={6} className="no-print">
                                    <HStack gap={0}>
                                        {[0.5, 1.0, 2.0].map((s, index, arr) => (
                                            <Button
                                                key={s}
                                                size="xs"
                                                variant={scale === s ? 'solid' : 'outline'}
                                                bg={scale === s ? 'vscode.button' : 'transparent'}
                                                borderColor="vscode.button"
                                                color={scale === s ? 'white' : 'vscode.button'}
                                                _hover={{ bg: scale === s ? 'vscode.buttonHover' : 'rgba(14, 99, 156, 0.1)' }}
                                                onClick={() => setScale(s)}
                                                borderTopRightRadius={index === arr.length - 1 ? 'md' : 0}
                                                borderBottomRightRadius={index === arr.length - 1 ? 'md' : 0}
                                                borderTopLeftRadius={index === 0 ? 'md' : 0}
                                                borderBottomLeftRadius={index === 0 ? 'md' : 0}
                                                borderRightWidth={index === arr.length - 1 ? 1 : 0}
                                                borderLeftWidth={1}
                                            >
                                                {s}x
                                            </Button>
                                        ))}
                                    </HStack>

                                    <HStack gap={2} alignItems="center">
                                        <Text fontSize="sm" fontWeight="medium" color="fg.muted">Metric</Text>
                                        <Switch.Root
                                            aria-label="Toggle Metric"
                                            checked={unitSystem === UnitSystem.METRIC || (!unitSystem && recipe.unit_system === UnitSystem.METRIC) || (!unitSystem && !recipe.unit_system)}
                                            onCheckedChange={(e) => setUnitSystem(e.checked ? UnitSystem.METRIC : UnitSystem.IMPERIAL)}
                                            size="sm"
                                            colorPalette="blue"
                                        >
                                            <Switch.HiddenInput />
                                            <Switch.Control>
                                                <Switch.Thumb />
                                            </Switch.Control>
                                        </Switch.Root>
                                    </HStack>
                                </HStack>
                                <Heading size="md" mb={4} fontWeight="bold" color="fg.default">INGREDIENTS</Heading>
                                <VStack align="stretch" gap={3}>
                                    {recipe.components.map((component, cIndex) => (
                                        <Box key={cIndex}>
                                            {component.name && component.name !== 'Main' && (
                                                <Text fontWeight="bold" mb={2} color="fg.default">{component.name}</Text>
                                            )}
                                            <List.Root gap={1} mb={component.name ? 4 : 0} ps={0} variant="plain">
                                                {component.ingredients
                                                    .slice()
                                                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                                                    .map((ingredient, index) => {
                                                        const isToTaste = ingredient.quantity === 0 && ingredient.unit.toLowerCase() === 'to taste';
                                                        return (
                                                            <List.Item key={index} display="flex" alignItems="center">
                                                                <List.Indicator asChild>
                                                                    <Box as="span" mr={3}>
                                                                        <Icon as={FaCheckCircle} color="vscode.accent" className="no-print" />
                                                                        <Icon as={FaRegSquare} color="fg.default" className="print-only" />
                                                                    </Box>
                                                                </List.Indicator>
                                                                <Text>
                                                                    {isToTaste ? (
                                                                        <>
                                                                            <Text as="span" fontWeight="bold">{ingredient.item}</Text> {ingredient.unit}
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Text as="span" fontWeight="bold">{formatQuantity(ingredient.quantity)} {ingredient.unit}</Text> {ingredient.item}
                                                                        </>
                                                                    )}
                                                                </Text>
                                                            </List.Item>
                                                        );
                                                    })}
                                            </List.Root>
                                        </Box>
                                    ))}
                                </VStack>
                            </Box>
                        </VStack>
                    </GridItem>

                    {/* Right Column: Description + Instructions */}
                    <GridItem>
                        <VStack align="start" gap={6} h="full" justifyContent="space-between">
                            <Text color="fg.muted" className="print-only" display={{ base: 'none', md: 'block' }}>{recipe.core.description}</Text>

                            <Box w="full">
                                <Heading size="md" mb={4} fontWeight="bold" color="fg.default">INSTRUCTIONS</Heading>
                                <VStack align="stretch" gap={2}>
                                    {(recipe.instructions || []).map((step) => (
                                        <Box key={step.step_number} p={1} bg='vscode.inputBg' borderWidth={1} borderColor='vscode.border' borderRadius="md">
                                            <Text fontWeight="bold" mb={1} color="vscode.accent">Step {step.step_number}</Text>
                                            <Text>{step.text}</Text>
                                        </Box>
                                    ))}
                                </VStack>
                            </Box>
                        </VStack>
                    </GridItem>
                </Grid>

                <Box as="hr" borderColor="border.default" my={8} />

                <CommentList recipeId={id || ''} />
            </Box>
        </Container>
    );
};

export default RecipeDetails;
