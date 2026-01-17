import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Spinner, Center, Container, Button, Icon, Table, VStack, IconButton, Text } from '@chakra-ui/react';
import { FaPlus, FaUtensils } from 'react-icons/fa';
import { useInfiniteMealTemplates, useGenerateMeal } from '../../../hooks/useMeals';
import { toaster } from '../../../toaster';
import ErrorAlert from '../../../components/common/ErrorAlert';
import { UserDisplay } from '../../../components/common/UserDisplay';

const TemplateList = () => {
    const navigate = useNavigate();
    const generateMeal = useGenerateMeal();
    const [generatingTemplateId, setGeneratingTemplateId] = useState<string | null>(null);

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteMealTemplates(20, 'name');

    const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        if (!sentinel) return;
        if (isFetchingNextPage || !hasNextPage) return;

        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasNextPage) {
                fetchNextPage();
            }
        }, {
            root: null,
            rootMargin: '200px',
            threshold: 0
        });

        observer.current.observe(sentinel);

        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, [sentinel, isFetchingNextPage, hasNextPage, fetchNextPage]);

    const handleTemplateClick = (id: string) => {
        navigate(`/meals/templates/${id}`);
    };

    const handleGenerateMeal = async (templateId: string, templateName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setGeneratingTemplateId(templateId);
        try {
            const meal = await generateMeal.mutateAsync(templateId);
            toaster.create({
                title: 'Meal generated successfully',
                type: 'success',
            });
            navigate(`/meals/${meal.id}`, {
                state: {
                    sourceTemplate: {
                        id: templateId,
                        name: templateName
                    },
                    fromTemplateList: true
                }
            });
        } catch (err) {
            console.error("Failed to generate meal", err);
            toaster.create({
                title: 'Failed to generate meal',
                type: 'error',
            });
            setGeneratingTemplateId(null);
        }
    };

    if (status === 'error') {
        return (
            <Container maxW="container.xl" py={0} px={0}>
                <ErrorAlert title="Failed to load templates" description={error?.message || "An unexpected error occurred."} />
            </Container>
        );
    }

    const templates = data?.pages.flatMap((page) => page.templates) || [];

    return (
        <Container maxW="container.xl" py={0} px={0}>
            <Box mb={4}>
                <Button
                    onClick={() => navigate('/meals/templates/new')}
                    bg="vscode.button"
                    color="white"
                    _hover={{ bg: "vscode.buttonHover" }}
                    alignSelf="flex-start"
                    size="xs"
                >
                    <Icon as={FaPlus} mr={2} /> Add Template
                </Button>
            </Box>

            <VStack align="stretch" gap={6}>
                <Box flex={1} overflowX="auto" borderWidth={1} borderColor="border.default" borderRadius="lg" bg="bg.surface" mb={4}>
                    <Table.Root interactive minW="800px">
                        <Table.Header>
                            <Table.Row bg="bg.surface">
                                <Table.ColumnHeader color="fg.default">Name</Table.ColumnHeader>
                                <Table.ColumnHeader color="fg.default">Classification</Table.ColumnHeader>
                                <Table.ColumnHeader color="fg.default">Slots</Table.ColumnHeader>
                                <Table.ColumnHeader color="fg.default">Created By</Table.ColumnHeader>
                                <Table.ColumnHeader color="fg.default">Created At</Table.ColumnHeader>
                                <Table.ColumnHeader color="fg.default" width="80px">Actions</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {templates.map((template) => (
                                <Table.Row
                                    key={template.id}
                                    onClick={() => handleTemplateClick(template.id)}
                                    cursor="pointer"
                                    bg="bg.surface"
                                    color="fg.default"
                                    _hover={{ bg: "bg.muted" }}
                                >
                                    <Table.Cell borderColor="border.default" fontWeight="medium">
                                        {template.name}
                                    </Table.Cell>
                                    <Table.Cell borderColor="border.default">{template.classification}</Table.Cell>
                                    <Table.Cell borderColor="border.default">
                                        {template.slots?.length || 0}
                                    </Table.Cell>
                                    <Table.Cell borderColor="border.default">
                                        <UserDisplay userId={template.user_id} />
                                    </Table.Cell>
                                    <Table.Cell borderColor="border.default">
                                        {new Date(template.created_at).toLocaleDateString()}
                                    </Table.Cell>
                                    <Table.Cell borderColor="border.default">
                                        <IconButton
                                            aria-label="Generate Meal"
                                            title="Generate Meal"
                                            size="xs"
                                            bg="green.600"
                                            color="white"
                                            _hover={{ bg: "green.700" }}
                                            onClick={(e) => handleGenerateMeal(template.id, template.name, e)}
                                            loading={generatingTemplateId === template.id}
                                        >
                                            <Icon as={FaUtensils} />
                                        </IconButton>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                            {templates.length === 0 && status === 'success' && (
                                <Table.Row bg="bg.surface">
                                    <Table.Cell colSpan={6} textAlign="center" color="fg.muted" borderColor="border.default">
                                        No templates found. Create one to get started!
                                    </Table.Cell>
                                </Table.Row>
                            )}
                        </Table.Body>
                    </Table.Root>
                </Box>

                {/* Sentinel for IntersectionObserver */}
                <Box ref={setSentinel} height="20px" bg="transparent" />

                {(status === 'pending' || isFetchingNextPage) && (
                    <Center p={4}>
                        <Spinner size="lg" color="vscode.accent" />
                    </Center>
                )}

                {!hasNextPage && status === 'success' && templates.length > 0 && (
                    <Center p={4}>
                        <Text color="fg.muted" fontSize="sm">No more templates to load</Text>
                    </Center>
                )}
            </VStack>
        </Container>
    );
};

export default TemplateList;
