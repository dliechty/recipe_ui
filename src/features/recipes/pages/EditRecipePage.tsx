import React, { useMemo } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { Container, Heading, Spinner, Center, Text, Breadcrumb, Icon } from '@chakra-ui/react';
import { FaChevronRight } from 'react-icons/fa';
import RecipeForm from '../components/RecipeForm';
import { useRecipe, useUpdateRecipe } from '../../../hooks/useRecipes';
import { RecipeCreate } from '../../../client';
import { toaster } from '../../../toaster';

const EditRecipePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: recipeData, isLoading: isFetching, error } = useRecipe(id || '');
    const updateRecipeMutation = useUpdateRecipe();

    const handleSubmit = (formData: RecipeCreate) => {
        updateRecipeMutation.mutate({ id: id || '', requestBody: formData }, {
            onSuccess: () => {
                toaster.create({
                    title: "Recipe updated",
                    type: "success",
                });
                navigate(`/recipes/${id}`);
            },
            onError: (error) => {
                console.error("Failed to update recipe:", error);
                toaster.create({
                    title: "Failed to update recipe",
                    description: error.message || "Unknown error",
                    type: "error",
                });
            }
        });
    };

    // Transform data for the form
    const initialData = useMemo<RecipeCreate | undefined>(() => {
        if (!recipeData) return undefined;
        return {
            core: {
                name: recipeData.core.name,
                description: recipeData.core.description,
                source: recipeData.core.source,
                yield_amount: recipeData.core.yield_amount,
                yield_unit: recipeData.core.yield_unit,
                difficulty: recipeData.core.difficulty,
                cuisine: recipeData.core.cuisine,
                category: recipeData.core.category,
                source_url: recipeData.core.source_url,
                slug: recipeData.core.slug
            },
            times: recipeData.times,
            nutrition: recipeData.nutrition,
            components: recipeData.components.map(comp => ({
                name: comp.name,
                ingredients: comp.ingredients.map(i => ({
                    ingredient_name: i.item,
                    quantity: i.quantity,
                    unit: i.unit,
                    notes: i.notes
                }))
            })),
            instructions: recipeData.instructions.map(i => ({
                step_number: i.step_number,
                text: i.text
            }))
        };
    }, [recipeData]);

    if (isFetching) {
        return (
            <Center h="50vh">
                <Spinner size="xl" color="vscode.accent" />
            </Center>
        );
    }

    if (error || !recipeData) {
        return (
            <Container maxW="container.md" py={8}>
                <Text>Recipe not found.</Text>
            </Container>
        );
    }

    return (
        <Container maxW="container.lg" pt={2} pb={8}>
            <Breadcrumb.Root mb={6} color="fg.muted" fontSize="sm">
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
                        <Breadcrumb.Link asChild color="vscode.accent" _hover={{ textDecoration: 'underline' }}>
                            <RouterLink to={`/recipes/${id}`}>{recipeData.core.name}</RouterLink>
                        </Breadcrumb.Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator>
                        <Icon as={FaChevronRight} color="fg.muted" />
                    </Breadcrumb.Separator>
                    <Breadcrumb.Item>
                        <Breadcrumb.CurrentLink color="fg.default">Edit</Breadcrumb.CurrentLink>
                    </Breadcrumb.Item>
                </Breadcrumb.List>
            </Breadcrumb.Root>
            <Heading mb={8} color="fg.default">Edit Recipe</Heading>
            <RecipeForm initialData={initialData} onSubmit={handleSubmit} isLoading={updateRecipeMutation.isPending} />
        </Container>
    );
};

export default EditRecipePage;
