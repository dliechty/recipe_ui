import React from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
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
    Spacer,
    Link,
    Breadcrumb
} from '@chakra-ui/react';
import { FaCheckCircle, FaEdit, FaChevronRight, FaRegCopy, FaRegSquare } from 'react-icons/fa';
import { useRecipe } from '../../../hooks/useRecipes';
import { useUser } from '../../../hooks/useUsers';
import { useAuth } from '../../../context/AuthContext';
import ErrorAlert from '../../../components/common/ErrorAlert';
import { formatQuantity, formatDuration, formatDietName } from '../../../utils/formatters';
import CommentList from './comments/CommentList';


const RecipeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: recipe, isLoading: loading, error } = useRecipe(id || '');
    const { data: parentRecipe } = useRecipe(recipe?.parent_recipe_id || '');
    const { data: user } = useUser(recipe?.core.owner_id);
    const { user: currentUser } = useAuth();

    if (error) {
        return (
            <Container maxW="container.xl" py={8}>
                <ErrorAlert title="Failed to load recipe" description={error.message || "An unexpected error occurred."} />
                <Button mt={4} onClick={() => navigate('/recipes')}>Back to Recipes</Button>
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
                    onClick={() => navigate('/recipes')}
                    bg="vscode.button"
                    color="white"
                    _hover={{ bg: "vscode.buttonHover" }}
                >
                    Back to Recipes
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
                    <Breadcrumb.Item>
                        <Breadcrumb.Link asChild color="vscode.accent" _hover={{ textDecoration: 'underline' }}>
                            <RouterLink to="/recipes">Recipes</RouterLink>
                        </Breadcrumb.Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator>
                        <Icon as={FaChevronRight} color="fg.muted" />
                    </Breadcrumb.Separator>
                    <Breadcrumb.Item>
                        <Breadcrumb.CurrentLink color="fg.default">{recipe.core.name}</Breadcrumb.CurrentLink>
                    </Breadcrumb.Item>
                </Breadcrumb.List>
            </Breadcrumb.Root>

            <HStack mb={6} className="no-print">
                <Spacer />
                {(canEdit || currentUser) && (
                    <HStack gap={2}>
                        {canEdit && (
                            <Button
                                onClick={() => navigate(`/recipes/${id}/edit`)}
                                bg="vscode.button"
                                color="white"
                                _hover={{ bg: "vscode.buttonHover" }}
                            >
                                <Icon as={FaEdit} /> Edit Recipe
                            </Button>
                        )}
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
                                            }
                                        }
                                    });
                                }}
                                bg="vscode.button"
                                color="white"
                                _hover={{ bg: "vscode.buttonHover" }}
                            >
                                <Icon as={FaRegCopy} /> Create Variant
                            </Button>
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

                            {/* Ingredients Section */}
                            <Box w="full">
                                <Heading size="md" mb={4} fontWeight="bold" color="fg.default">INGREDIENTS</Heading>
                                <VStack align="stretch" gap={3}>
                                    {recipe.components.map((component, cIndex) => (
                                        <Box key={cIndex}>
                                            {component.name && component.name !== 'Main' && (
                                                <Text fontWeight="bold" mb={2} color="fg.default">{component.name}</Text>
                                            )}
                                            <List.Root gap={1} mb={component.name ? 4 : 0}>
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
                            <Text color="fg.muted">{recipe.core.description}</Text>

                            <Box w="full">
                                <Heading size="md" mb={4} fontWeight="bold" color="fg.default">INSTRUCTIONS</Heading>
                                <VStack align="stretch" gap={2}>
                                    {(recipe.instructions || []).map((step) => (
                                        <Box key={step.step_number} p={1} _light={{ bg: "gray.50" }} _dark={{ bg: 'vscode.inputBg', borderWidth: 1, borderColor: 'vscode.border' }} borderRadius="md">
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





        </Container >
    );
};

export default RecipeDetails;
