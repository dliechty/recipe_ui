import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { Container, Breadcrumb, Icon, Spinner, Center } from '@chakra-ui/react';
import { FaChevronRight } from 'react-icons/fa';
import { useMealTemplate, useUpdateMealTemplate } from '../../../hooks/useMeals';
import { MealTemplateCreate } from '../../../client';
import { toaster } from '../../../toaster';
import TemplateForm from '../components/TemplateForm';
import ErrorAlert from '../../../components/common/ErrorAlert';

const EditTemplatePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: template, isLoading, error } = useMealTemplate(id || '');
    const updateTemplateMutation = useUpdateMealTemplate();

    if (isLoading) {
        return (
            <Center h="50vh">
                <Spinner size="xl" color="vscode.accent" />
            </Center>
        );
    }

    if (error || !template) {
        return (
            <Container maxW="container.md" py={8}>
                <ErrorAlert
                    title="Template not found"
                    description={error?.message || "The requested template could not be found."}
                />
            </Container>
        );
    }

    const handleSubmit = async (formData: MealTemplateCreate) => {
        updateTemplateMutation.mutate(
            { id: template.id, requestBody: formData },
            {
                onSuccess: () => {
                    toaster.create({
                        title: "Template updated successfully",
                        type: "success"
                    });
                    navigate(`/meals/templates/${template.id}`);
                },
                onError: (error: Error) => {
                    toaster.create({
                        title: "Failed to update template",
                        description: error.message,
                        type: "error"
                    });
                }
            }
        );
    };

    const handleCancel = () => {
        navigate(`/meals/templates/${template.id}`);
    };

    // Convert template to initialData format
    const initialData: Partial<MealTemplateCreate> = {
        name: template.name,
        classification: template.classification,
        slots: template.slots?.map(slot => ({
            strategy: slot.strategy,
            recipe_id: slot.recipe_id,
            recipe_ids: slot.recipe_ids,
            search_criteria: slot.search_criteria
        }))
    };

    return (
        <Container maxW="container.lg" pt={2} pb={8}>
            <Breadcrumb.Root mb={6} color="fg.muted" fontSize="sm">
                <Breadcrumb.List>
                    <Breadcrumb.Item>
                        <Breadcrumb.Link asChild color="vscode.accent" _hover={{ textDecoration: 'underline' }}>
                            <RouterLink to="/meals/templates">Templates</RouterLink>
                        </Breadcrumb.Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator>
                        <Icon as={FaChevronRight} color="fg.muted" />
                    </Breadcrumb.Separator>
                    <Breadcrumb.Item>
                        <Breadcrumb.Link asChild color="vscode.accent" _hover={{ textDecoration: 'underline' }}>
                            <RouterLink to={`/meals/templates/${template.id}`}>{template.name || 'Template'}</RouterLink>
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

            <TemplateForm
                onSubmit={handleSubmit}
                isLoading={updateTemplateMutation.isPending}
                initialData={initialData}
                onCancel={handleCancel}
            />
        </Container>
    );
};

export default EditTemplatePage;
