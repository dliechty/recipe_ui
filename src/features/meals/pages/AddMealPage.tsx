import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { Container, Breadcrumb, Icon } from '@chakra-ui/react';
import { FaChevronRight } from 'react-icons/fa';
import { useCreateMeal } from '../../../hooks/useMeals';
import { MealCreate } from '../../../client';
import { toaster } from '../../../toaster';
import MealForm from '../components/MealForm';

const AddMealPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const initialData = location.state?.initialData;
    const createMealMutation = useCreateMeal();

    const handleSubmit = async (formData: MealCreate) => {
        createMealMutation.mutate(formData, {
            onSuccess: () => {
                toaster.create({
                    title: "Meal created successfully",
                    type: "success"
                });
                navigate('/meals');
            },
            onError: (error: Error) => {
                toaster.create({
                    title: "Failed to create meal",
                    description: error.message,
                    type: "error"
                });
            }
        });
    };

    const handleCancel = () => {
        navigate('/meals');
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
                    {location.state?.sourceMeal ? (
                        <>
                            <Breadcrumb.Item>
                                <Breadcrumb.Link asChild color="vscode.accent" _hover={{ textDecoration: 'underline' }}>
                                    <RouterLink to={`/meals/${location.state.sourceMeal.id}`}>
                                        {location.state.sourceMeal.name}
                                    </RouterLink>
                                </Breadcrumb.Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Separator>
                                <Icon as={FaChevronRight} color="fg.muted" />
                            </Breadcrumb.Separator>
                            <Breadcrumb.Item>
                                <Breadcrumb.CurrentLink color="fg.default">Duplicate Meal</Breadcrumb.CurrentLink>
                            </Breadcrumb.Item>
                        </>
                    ) : (
                        <Breadcrumb.Item>
                            <Breadcrumb.CurrentLink color="fg.default">Add Meal</Breadcrumb.CurrentLink>
                        </Breadcrumb.Item>
                    )}
                </Breadcrumb.List>
            </Breadcrumb.Root>

            <MealForm
                onSubmit={handleSubmit}
                isLoading={createMealMutation.isPending}
                initialData={initialData}
                onCancel={handleCancel}
            />
        </Container>
    );
};

export default AddMealPage;
