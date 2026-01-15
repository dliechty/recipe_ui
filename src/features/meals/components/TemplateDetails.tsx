import { useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Heading, Text, VStack, HStack, Button, Badge, Spinner, Center, Card, Breadcrumb, Icon, Grid } from '@chakra-ui/react';
import { FaChevronRight, FaRegCopy, FaEdit } from 'react-icons/fa';
import { useMealTemplate, useDeleteMealTemplate } from '../../../hooks/useMeals';
import { useUser } from '../../../hooks/useUsers';
import { useAuth } from '../../../context/AuthContext';
import ErrorAlert from '../../../components/common/ErrorAlert';

const TemplateDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: template, isLoading, error } = useMealTemplate(id || '');
    const deleteTemplate = useDeleteMealTemplate();
    const { user: currentUser } = useAuth();
    const { data: creator } = useUser(template?.user_id);

    const [isDeleting, setIsDeleting] = useState(false);

    const canEdit = currentUser?.is_admin || (currentUser?.id && template?.user_id && currentUser.id === template.user_id);

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
                <Button mt={4} onClick={() => navigate('/meals/templates')}>Back to Templates</Button>
            </Container>
        );
    }

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            setIsDeleting(true);
            try {
                await deleteTemplate.mutateAsync(template.id);
                navigate('/meals/templates');
            } catch (e) {
                console.error("Failed to delete template", e);
                setIsDeleting(false);
            }
        }
    };

    const handleGenerateMeal = async () => {
        // In real app, this might call POST /meals/generate?template_id=...
        // But useCreateMeal hooks usually takes MealCreate not query param generation.
        // Wait, MealsService has generateMealMealsGeneratePost. Checked earlier.
        // I need a hook for that.
        // For now, I'll alert or mock it if hook missing.
        // I'll assume I can implement the hook later or use a generic one.
        // Actually I should add `useGenerateMeal` to useMeals.ts.
        window.alert("Generate Meal functionality implementation pending API hook update.");
    };

    const getCreatorName = () => {
        if (!creator) return 'Unknown';
        if (creator.first_name && creator.last_name) return `${creator.first_name} ${creator.last_name}`;
        if (creator.first_name) return creator.first_name;
        return creator.email || 'Unknown';
    };

    return (
        <Container maxW="container.lg" py={8}>
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
                        <Breadcrumb.CurrentLink color="fg.default">{template.name || 'Untitled Template'}</Breadcrumb.CurrentLink>
                    </Breadcrumb.Item>
                </Breadcrumb.List>
            </Breadcrumb.Root>

            <HStack mb={6} gap={2} className="no-print">
                {currentUser && (
                    <Button
                        onClick={() => {
                            navigate('/meals/templates/new', {
                                state: {
                                    initialData: {
                                        name: `${template.name} (Copy)`,
                                        classification: template.classification,
                                        slots: template.slots?.map(slot => ({
                                            strategy: slot.strategy
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
                        <Icon as={FaRegCopy} /> Duplicate Template
                    </Button>
                )}
                {canEdit && (
                    <Button
                        onClick={() => navigate(`/meals/templates/${template.id}/edit`)}
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
                {currentUser && (
                    <Button
                        onClick={handleGenerateMeal}
                        bg="green.600"
                        color="white"
                        _hover={{ bg: "green.700" }}
                        size="xs"
                    >
                        Generate Meal
                    </Button>
                )}
            </HStack>

            <VStack align="stretch" gap={6}>
                <VStack align="start" gap={4}>
                    <Heading size="lg">{template.name || 'Untitled Template'}</Heading>

                    {/* Metadata Grid */}
                    <Grid templateColumns="auto 1fr" gap={2} rowGap={2} mb={0}>
                        {template.classification && (
                            <>
                                <Text fontWeight="bold" color="fg.muted" fontSize="sm">Classification:</Text>
                                <Box>
                                    <Badge colorPalette="teal">{template.classification}</Badge>
                                </Box>
                            </>
                        )}

                        {creator && (
                            <>
                                <Text fontWeight="bold" color="fg.muted" fontSize="sm">Created By:</Text>
                                <Text fontSize="sm">{getCreatorName()}</Text>
                            </>
                        )}

                        <Text fontWeight="bold" color="fg.muted" fontSize="sm">Created:</Text>
                        <Text fontSize="sm">{new Date(template.created_at).toLocaleString()}</Text>

                        <Text fontWeight="bold" color="fg.muted" fontSize="sm">Updated:</Text>
                        <Text fontSize="sm">{new Date(template.updated_at).toLocaleString()}</Text>
                    </Grid>
                </VStack>

                <Box>
                    <Text fontSize="lg" fontWeight="bold" mb={4}>Slots</Text>
                    {template.slots && template.slots.length > 0 ? (
                        <VStack align="stretch" gap={4}>
                            {template.slots.map((slot, index) => (
                                <Card.Root key={slot.id} variant="outline" p={4}>
                                    <HStack justify="space-between">
                                        <VStack align="start" gap={0}>
                                            <Text fontWeight="medium">Slot {index + 1}</Text>
                                            <Text fontSize="sm" color="fg.muted">Strategy: {slot.strategy}</Text>
                                        </VStack>
                                    </HStack>
                                </Card.Root>
                            ))}
                        </VStack>
                    ) : (
                        <Text color="fg.muted">No slots defined.</Text>
                    )}
                </Box>

            </VStack>
        </Container>
    );
};

export default TemplateDetails;
