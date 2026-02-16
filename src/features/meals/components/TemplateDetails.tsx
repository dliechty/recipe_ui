import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Heading, Text, VStack, HStack, Button, Badge, Spinner, Center, Breadcrumb, Icon, Grid } from '@chakra-ui/react';
import { FaChevronRight, FaRegCopy, FaEdit, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useMealTemplate, useDeleteMealTemplate, useCreateMeal } from '../../../hooks/useMeals';
import { toaster } from '../../../toaster';
import { useUser } from '../../../hooks/useUsers';
import { useAuth } from '../../../context/AuthContext';
import ErrorAlert from '../../../components/common/ErrorAlert';
import TemplateSlotCard from './TemplateSlotCard';
import GenerateMealModal from './GenerateMealModal';

const TemplateDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const sourceMeal = location.state?.sourceMeal as { id: string; name: string } | undefined;
    const { data: template, isLoading, error } = useMealTemplate(id || '');
    const deleteTemplate = useDeleteMealTemplate();
    const createMeal = useCreateMeal();
    const { user: currentUser } = useAuth();
    const { data: creator } = useUser(template?.user_id);

    const [isDeleting, setIsDeleting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    
    // State for expanded slots, initialized from sessionStorage if available
    const [expandedSlotIds, setExpandedSlotIds] = useState<Set<string>>(() => {
        if (!id) return new Set();
        try {
            const saved = sessionStorage.getItem(`template_expansion_${id}`);
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch (e) {
            console.error("Failed to load expansion state", e);
            return new Set();
        }
    });

    // Save expansion state to sessionStorage whenever it changes
    useEffect(() => {
        if (!id) return;
        try {
            sessionStorage.setItem(`template_expansion_${id}`, JSON.stringify(Array.from(expandedSlotIds)));
        } catch (e) {
            console.error("Failed to save expansion state", e);
        }
    }, [expandedSlotIds, id]);

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

    const confirmGenerateMeal = async (scheduledDate: string | null) => {
        if (!template) return;
        setIsGenerating(true);
        try {
            const meal = await createMeal.mutateAsync({
                name: template.name,
                classification: template.classification ?? undefined,
                scheduled_date: scheduledDate || undefined,
                template_id: template.id,
                items: template.slots
                    .filter(slot => slot.recipe_id)
                    .map(slot => ({ recipe_id: slot.recipe_id! })),
            });
            toaster.create({
                title: 'Meal generated successfully',
                type: 'success',
            });
            setIsGenerateModalOpen(false);
            navigate(`/meals/${meal.id}`, {
                state: {
                    sourceTemplate: {
                        id: template.id,
                        name: template.name
                    }
                }
            });
        } catch (e) {
            console.error("Failed to generate meal", e);
            toaster.create({
                title: 'Failed to generate meal',
                type: 'error',
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const getCreatorName = () => {
        if (!creator) return 'Unknown';
        if (creator.first_name && creator.last_name) return `${creator.first_name} ${creator.last_name}`;
        if (creator.first_name) return creator.first_name;
        return creator.email || 'Unknown';
    };

    const handleToggleSlot = (slotId: string) => {
        const newSet = new Set(expandedSlotIds);
        if (newSet.has(slotId)) {
            newSet.delete(slotId);
        } else {
            newSet.add(slotId);
        }
        setExpandedSlotIds(newSet);
    };

    const allExpanded = template.slots && template.slots.length > 0 && expandedSlotIds.size === template.slots.length;

    const handleToggleAll = () => {
        if (allExpanded) {
            setExpandedSlotIds(new Set());
        } else {
            if (template.slots) {
                setExpandedSlotIds(new Set(template.slots.map(s => s.id)));
            }
        }
    };

    return (
        <Container maxW="container.lg" py={8}>
            <Breadcrumb.Root mb={6} color="fg.muted" fontSize="sm">
                <Breadcrumb.List>
                    {sourceMeal ? (
                        <>
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
                                    <RouterLink to={`/meals/${sourceMeal.id}`}>
                                        {sourceMeal.name || 'Meal'}
                                    </RouterLink>
                                </Breadcrumb.Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Separator>
                                <Icon as={FaChevronRight} color="fg.muted" />
                            </Breadcrumb.Separator>
                            <Breadcrumb.Item>
                                <Breadcrumb.CurrentLink color="fg.default">{template.name || 'Untitled Template'}</Breadcrumb.CurrentLink>
                            </Breadcrumb.Item>
                        </>
                    ) : (
                        <>
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
                        </>
                    )}
                </Breadcrumb.List>
            </Breadcrumb.Root>

            <HStack mb={6} gap={2} className="no-print">
                {currentUser && (
                    <Button
                        onClick={() => setIsGenerateModalOpen(true)}
                        loading={isGenerating}
                        bg="button.success"
                        color="white"
                        _hover={{ bg: "button.successHover" }}
                        size="xs"
                    >
                        Generate Meal
                    </Button>
                )}
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
                                    },
                                    sourceTemplateId: template.id,
                                    sourceTemplateName: template.name
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
                        bg="button.danger"
                        color="white"
                        _hover={{ bg: "button.dangerHover" }}
                        size="xs"
                    >
                        Delete
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
                    <HStack justify="space-between" mb={4} align="center">
                         <Text fontSize="lg" fontWeight="bold">Slots</Text>
                         <Button
                             size="xs"
                             bg="vscode.button"
                             color="white"
                             _hover={{ bg: "vscode.buttonHover" }}
                             onClick={handleToggleAll}
                         >
                             {allExpanded ? 'Collapse All' : 'Expand All'}
                             <Icon as={allExpanded ? FaChevronUp : FaChevronDown} ml={2} />
                         </Button>
                    </HStack>

                    {template.slots && template.slots.length > 0 ? (
                        <VStack align="stretch" gap={4}>
                            {template.slots.map((slot, index) => (
                                <TemplateSlotCard
                                    key={slot.id}
                                    slot={slot}
                                    slotNumber={index + 1}
                                    templateName={template.name || 'Untitled Template'}
                                    isExpanded={expandedSlotIds.has(slot.id)}
                                    onToggle={() => handleToggleSlot(slot.id)}
                                />
                            ))}
                        </VStack>
                    ) : (
                        <Text color="fg.muted">No slots defined.</Text>
                    )}
                </Box>

            </VStack>
            
            <GenerateMealModal
                isOpen={isGenerateModalOpen}
                onClose={() => setIsGenerateModalOpen(false)}
                onGenerate={confirmGenerateMeal}
                isGenerating={isGenerating}
                templateName={template.name || 'Untitled Template'}
            />
        </Container>
    );
};

export default TemplateDetails;