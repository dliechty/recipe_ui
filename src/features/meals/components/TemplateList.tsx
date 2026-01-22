import { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Spinner, Center, Container, Button, Icon, Table, VStack, IconButton, Text } from '@chakra-ui/react';
import { FaPlus, FaUtensils } from 'react-icons/fa';
import { useInfiniteMealTemplates, useGenerateMeal } from '../../../hooks/useMeals';
import { toaster } from '../../../toaster';
import ErrorAlert from '../../../components/common/ErrorAlert';
import { UserDisplay } from '../../../components/common/UserDisplay';
import GenerateMealModal from './GenerateMealModal';
import TemplateFilters from './TemplateFilters';
import { searchParamsToTemplateFilters, templateFiltersToSearchParams } from '../../../utils/mealParams';

const TemplateList = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const generateMeal = useGenerateMeal();
    const [generatingTemplateId, setGeneratingTemplateId] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<{ id: string, name: string } | null>(null);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

    // Parse filters from URL
    const filters = useMemo(() => {
        const parsed = searchParamsToTemplateFilters(searchParams);
        // Default sort if not present
        if (!parsed.sort) {
            parsed.sort = 'name';
        }
        return parsed;
    }, [searchParams]);

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteMealTemplates(20, filters);

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

    const handleFilterChange = (newFilters: typeof filters) => {
        setSearchParams(templateFiltersToSearchParams(newFilters));
    };

    const currentSort = filters.sort || 'name';
    const isDesc = currentSort.startsWith('-');
    const sortField = isDesc ? currentSort.slice(1) : currentSort;
    const sortDirection = isDesc ? 'desc' : 'asc';

    const handleSortFieldChange = (newField: string) => {
        const newSort = sortDirection === 'desc' ? `-${newField}` : newField;
        handleFilterChange({ ...filters, sort: newSort });
    };

    const handleSortDirectionChange = (newDirection: string) => {
        const prefix = newDirection === 'desc' ? '-' : '';
        const newSort = `${prefix}${sortField}`;
        handleFilterChange({ ...filters, sort: newSort });
    };

    const handleGenerateClick = (templateId: string, templateName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedTemplate({ id: templateId, name: templateName });
        setIsGenerateModalOpen(true);
    };

    const confirmGenerateMeal = async (scheduledDate: string | null) => {
        if (!selectedTemplate) return;
        setGeneratingTemplateId(selectedTemplate.id);
        try {
            const meal = await generateMeal.mutateAsync({
                templateId: selectedTemplate.id,
                scheduledDate
            });
            toaster.create({
                title: 'Meal generated successfully',
                type: 'success',
            });
            setIsGenerateModalOpen(false);
            navigate(`/meals/${meal.id}`, {
                state: {
                    sourceTemplate: {
                        id: selectedTemplate.id,
                        name: selectedTemplate.name
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
        } finally {
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
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={3}>
                <Button
                    onClick={() => navigate('/meals/templates/new')}
                    bg="vscode.button"
                    color="white"
                    _hover={{ bg: "vscode.buttonHover" }}
                    size="xs"
                >
                    <Icon as={FaPlus} mr={2} /> Add Template
                </Button>

                <Box display="flex" gap={4} alignItems="center" flexWrap="wrap">
                    <Box display="flex" gap={2} alignItems="center">
                        <Text fontSize="sm" color="fg.muted" whiteSpace="nowrap">Sort:</Text>
                        <Box minW="130px">
                            <select
                                value={sortField}
                                onChange={(e) => handleSortFieldChange(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "6px",
                                    borderRadius: "4px",
                                    backgroundColor: "#3c3c3c",
                                    borderColor: "#454545",
                                    borderWidth: "1px",
                                    fontSize: "0.875rem",
                                    color: "#d4d4d4",
                                    outline: "none"
                                }}
                            >
                                <option value="name">Name</option>
                                <option value="updated_at">Last Updated</option>
                            </select>
                        </Box>
                    </Box>
                    <Box minW="110px">
                        <select
                            value={sortDirection}
                            onChange={(e) => handleSortDirectionChange(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "6px",
                                borderRadius: "4px",
                                backgroundColor: "#3c3c3c",
                                borderColor: "#454545",
                                borderWidth: "1px",
                                fontSize: "0.875rem",
                                color: "#d4d4d4",
                                outline: "none"
                            }}
                        >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </Box>
                </Box>
            </Box>

            <Box mb={6}>
                <TemplateFilters filters={filters} onFilterChange={handleFilterChange} />
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
                                            onClick={(e) => handleGenerateClick(template.id, template.name, e)}
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

            <GenerateMealModal
                isOpen={isGenerateModalOpen}
                onClose={() => setIsGenerateModalOpen(false)}
                onGenerate={confirmGenerateMeal}
                isGenerating={!!generatingTemplateId}
                templateName={selectedTemplate?.name || ''}
            />
        </Container>
    );
};

export default TemplateList;