import { useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Heading, Text, VStack, HStack, Button, Badge, Spinner, Center, Card, Breadcrumb, Icon } from '@chakra-ui/react';
import { FaChevronRight, FaRegCopy, FaEdit } from 'react-icons/fa';
import { useMeal, useDeleteMeal } from '../../../hooks/useMeals';
import { useAuth } from '../../../context/AuthContext';
import ErrorAlert from '../../../components/common/ErrorAlert';
import { MealItem } from '../../../client';

interface MealItemWithRecipe extends MealItem {
    recipe?: {
        name: string;
    };
}

const MealDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: meal, isLoading, error } = useMeal(id || '');
    const deleteMeal = useDeleteMeal();
    const { user: currentUser } = useAuth();

    const [isDeleting, setIsDeleting] = useState(false);

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

    return (
        <Container maxW="container.lg" py={8}>
            <Breadcrumb.Root mb={6} color="fg.muted" fontSize="sm">
                <Breadcrumb.List>
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
                        onClick={() => navigate(`/meals/${meal.id}/edit`)}
                        bg="vscode.button"
                        color="white"
                        _hover={{ bg: "vscode.buttonHover" }}
                        size="xs"
                    >
                        <Icon as={FaEdit} /> Edit
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
                <VStack align="start" gap={1}>
                    <Heading size="lg">{meal.name || 'Untitled Meal'}</Heading>
                    <HStack>
                        <Badge colorPalette={meal.status === 'Cooked' ? 'green' : meal.status === 'Scheduled' ? 'blue' : 'gray'}>
                            {meal.status}
                        </Badge>
                        {meal.classification && <Badge variant="outline">{meal.classification}</Badge>}
                    </HStack>
                </VStack>

                <Box>
                    <Text fontSize="lg" fontWeight="bold" mb={4}>Recipes</Text>
                    {meal.items && meal.items.length > 0 ? (
                        <VStack align="stretch" gap={4}>
                            {meal.items.map((item) => (
                                <Card.Root key={item.id} variant="outline" p={4}>
                                    <HStack justify="space-between">
                                        <Text fontWeight="medium">
                                            {/* Assuming item would have recipe details populated or we fetch them separately.
                                                For now displaying ID or if mock data enriched it.
                                                The mock data has 'recipe' property but type doesn't.
                                                We'll just show Recipe ID for now or try to cast if we trusted mock enrichment.
                                                Let's stay safe and just show "Recipe [ID]" if name unavailable.
                                            */}
                                            {(item as MealItemWithRecipe).recipe?.name || `Recipe ${item.recipe_id}`}
                                        </Text>
                                        <Button
                                            size="xs"
                                            variant="ghost"
                                            onClick={() => navigate(`/recipes/${item.recipe_id}`, {
                                                state: {
                                                    breadcrumbs: [
                                                        { label: 'Meals', url: '/meals' },
                                                        { label: meal.name || 'Meal', url: `/meals/${meal.id}` }
                                                    ]
                                                }
                                            })}
                                        >
                                            View Recipe
                                        </Button>
                                    </HStack>
                                </Card.Root>
                            ))}
                        </VStack>
                    ) : (
                        <Text color="fg.muted">No recipes in this meal.</Text>
                    )}
                </Box>

                <Box pt={4} borderTopWidth={1} borderColor="border.default">
                    <Text fontSize="sm" color="fg.muted">
                        Created: {new Date(meal.created_at).toLocaleString()}
                    </Text>
                    <Text fontSize="sm" color="fg.muted">
                        Last Updated: {new Date(meal.updated_at).toLocaleString()}
                    </Text>
                </Box>
            </VStack>
        </Container>
    );
};

export default MealDetails;
