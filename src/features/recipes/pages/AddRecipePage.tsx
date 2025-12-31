import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Container, Heading, Breadcrumb, Icon } from '@chakra-ui/react';
import { FaChevronRight } from 'react-icons/fa';
import RecipeForm from '../components/RecipeForm';
import { useCreateRecipe } from '../../../hooks/useRecipes';
import { RecipeCreate } from '../../../client';
import { toaster } from '../../../toaster';

const AddRecipePage = () => {
    const navigate = useNavigate();
    const createRecipeMutation = useCreateRecipe();

    const handleSubmit = async (formData: RecipeCreate) => {
        createRecipeMutation.mutate(formData, {
            onSuccess: () => {
                toaster.create({
                    title: "Recipe created",
                    type: "success",
                });
                navigate('/recipes');
            },
            onError: (error) => {
                console.error("Failed to create recipe:", error);
                toaster.create({
                    title: "Failed to create recipe",
                    description: error.message || "Unknown error",
                    type: "error",
                });
            }
        });
    };

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
                        <Breadcrumb.CurrentLink color="fg.default">New</Breadcrumb.CurrentLink>
                    </Breadcrumb.Item>
                </Breadcrumb.List>
            </Breadcrumb.Root>
            <Heading mb={8} color="fg.default">Add New Recipe</Heading>
            <RecipeForm onSubmit={handleSubmit} isLoading={createRecipeMutation.isPending} />
        </Container>
    );
};

export default AddRecipePage;
