import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { Container, Breadcrumb, Icon } from '@chakra-ui/react';
import { FaChevronRight } from 'react-icons/fa';
import { useCreateMealTemplate } from '../../../hooks/useMeals';
import { MealTemplateCreate } from '../../../client';
import { toaster } from '../../../toaster';
import TemplateForm from '../components/TemplateForm';

const AddTemplatePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const initialData = location.state?.initialData;
    const sourceTemplateId = location.state?.sourceTemplateId;
    const sourceTemplateName = location.state?.sourceTemplateName;
    const createTemplateMutation = useCreateMealTemplate();

    const handleSubmit = async (formData: MealTemplateCreate) => {
        createTemplateMutation.mutate(formData, {
            onSuccess: () => {
                toaster.create({
                    title: "Template created successfully",
                    type: "success"
                });
                navigate('/meals/templates');
            },
            onError: (error: Error) => {
                toaster.create({
                    title: "Failed to create template",
                    description: error.message,
                    type: "error"
                });
            }
        });
    };

    const handleCancel = () => {
        navigate('/meals/templates');
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
                    {sourceTemplateId && sourceTemplateName && (
                        <>
                            <Breadcrumb.Separator>
                                <Icon as={FaChevronRight} color="fg.muted" />
                            </Breadcrumb.Separator>
                            <Breadcrumb.Item>
                                <Breadcrumb.Link asChild color="vscode.accent" _hover={{ textDecoration: 'underline' }}>
                                    <RouterLink to={`/meals/templates/${sourceTemplateId}`}>
                                        {sourceTemplateName}
                                    </RouterLink>
                                </Breadcrumb.Link>
                            </Breadcrumb.Item>
                        </>
                    )}
                    <Breadcrumb.Separator>
                        <Icon as={FaChevronRight} color="fg.muted" />
                    </Breadcrumb.Separator>
                    <Breadcrumb.Item>
                        <Breadcrumb.CurrentLink color="fg.default">
                            {initialData ? 'Duplicate Template' : 'Add Template'}
                        </Breadcrumb.CurrentLink>
                    </Breadcrumb.Item>
                </Breadcrumb.List>
            </Breadcrumb.Root>

            <TemplateForm
                onSubmit={handleSubmit}
                isLoading={createTemplateMutation.isPending}
                initialData={initialData}
                onCancel={handleCancel}
            />
        </Container>
    );
};

export default AddTemplatePage;
