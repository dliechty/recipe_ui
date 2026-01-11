import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { Container, Breadcrumb, Icon, Spinner, Center } from '@chakra-ui/react';
import { FaChevronRight } from 'react-icons/fa';
import { useMeal, useUpdateMeal } from '../../../hooks/useMeals';
import { MealCreate } from '../../../client';
import { toaster } from '../../../toaster';
import MealForm from '../components/MealForm';
import ErrorAlert from '../../../components/common/ErrorAlert';

const EditMealPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: meal, isLoading, error } = useMeal(id || '');
    const updateMealMutation = useUpdateMeal();

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
            </Container>
        );
    }

    const handleSubmit = async (formData: MealCreate) => {
        updateMealMutation.mutate(
            { id: meal.id, requestBody: formData },
            {
                onSuccess: () => {
                    toaster.create({
                        title: "Meal updated successfully",
                        type: "success"
                    });
                    navigate(`/meals/${meal.id}`);
                },
                onError: (error: Error) => {
                    toaster.create({
                        title: "Failed to update meal",
                        description: error.message,
                        type: "error"
                    });
                }
            }
        );
    };

    const handleCancel = () => {
        navigate(`/meals/${meal.id}`);
    };

    // Convert meal to initialData format
    const initialData: Partial<MealCreate> = {
        name: meal.name,
        status: meal.status,
        classification: meal.classification,
        date: meal.date,
        items: meal.items?.map(item => ({ recipe_id: item.recipe_id }))
    };

    return (
        <Container maxW="container.lg" pt={2} pb={8}>
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
                        <Breadcrumb.Link asChild color="vscode.accent" _hover={{ textDecoration: 'underline' }}>
                            <RouterLink to={`/meals/${meal.id}`}>{meal.name || 'Meal'}</RouterLink>
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

            <MealForm
                onSubmit={handleSubmit}
                isLoading={updateMealMutation.isPending}
                initialData={initialData}
                onCancel={handleCancel}
            />
        </Container>
    );
};

export default EditMealPage;
