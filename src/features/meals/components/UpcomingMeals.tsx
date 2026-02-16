import { useMemo, useRef, useState } from 'react';
import { Box, VStack, Text, Button, Icon, IconButton, Spinner, Center, HStack } from '@chakra-ui/react';
import { FaPlus, FaMagic, FaShoppingCart, FaList, FaCalendarAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useInfiniteMeals, useBulkUpdateMeals, useGenerateMeals } from '../../../hooks/useMeals';
import { useInfiniteRecipes } from '../../../hooks/useRecipes';
import { useAuth } from '../../../context/AuthContext';
import { MealStatus, MealGenerateRequest } from '../../../client';
import MealQueueCard from './MealQueueCard';
import GenerateMealsModal from './GenerateMealsModal';
import ShoppingListPanel from './ShoppingListPanel';
import CalendarView from './CalendarView';
import ErrorAlert from '../../../components/common/ErrorAlert';

const UpcomingMeals = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const bulkUpdate = useBulkUpdateMeals();
    const generateMeals = useGenerateMeals();
    const [generateModalOpen, setGenerateModalOpen] = useState(false);
    const [shoppingPanelOpen, setShoppingPanelOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'queue' | 'calendar'>('queue');

    const filters = useMemo(() => ({
        status: [MealStatus.QUEUED],
        owner: user?.id ? [user.id] : [],
        sort: 'queue_position',
    }), [user?.id]);

    const {
        data,
        error,
        status,
    } = useInfiniteMeals(100, filters);

    const meals = useMemo(() =>
        data?.pages.flatMap((page) => page.meals) || [],
        [data]
    );

    // Collect recipe IDs with stable reference (only changes when actual IDs change)
    const prevRecipeIdsRef = useRef<string[]>([]);
    const recipeIds = useMemo(() => {
        const ids = new Set<string>();
        meals.forEach(meal => {
            meal.items?.forEach(item => {
                if (item.recipe_id) ids.add(item.recipe_id);
            });
        });
        const sorted = Array.from(ids).sort();
        const prev = prevRecipeIdsRef.current;
        if (sorted.length === prev.length && sorted.every((id, i) => id === prev[i])) {
            return prev;
        }
        prevRecipeIdsRef.current = sorted;
        return sorted;
    }, [meals]);

    // Fetch recipe names
    const { data: recipesData } = useInfiniteRecipes(
        recipeIds.length || 1,
        { ids: recipeIds },
        { enabled: recipeIds.length > 0 }
    );

    const recipeNames = useMemo(() => {
        const map: Record<string, string> = {};
        recipesData?.pages.flatMap(p => p.recipes).forEach(r => {
            map[r.core.id] = r.core.name;
        });
        return map;
    }, [recipesData]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = meals.findIndex(m => m.id === active.id);
        const newIndex = meals.findIndex(m => m.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        // Calculate new order
        const reordered = [...meals];
        const [moved] = reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, moved);

        // Update queue_position for all affected meals
        // (cache is optimistically updated in useBulkUpdateMeals onMutate)
        const updates = reordered.map((meal, idx) => ({
            id: meal.id,
            requestBody: { queue_position: idx },
        }));

        bulkUpdate.mutate(updates);
    };

    if (status === 'error') {
        return <ErrorAlert title="Failed to load meals" description={error?.message || "An unexpected error occurred."} />;
    }

    return (
        <Box>
            <HStack mb={4} justifyContent="space-between" flexWrap="wrap" gap={3}>
                <HStack gap={2}>
                    <Button
                        onClick={() => navigate('/meals/new')}
                        bg="vscode.button"
                        color="white"
                        _hover={{ bg: "vscode.buttonHover" }}
                        size="xs"
                    >
                        <Icon as={FaPlus} mr={1} /> Add Meal
                    </Button>
                    <Button
                        onClick={() => setGenerateModalOpen(true)}
                        bg="vscode.button"
                        color="white"
                        _hover={{ bg: "vscode.buttonHover" }}
                        size="xs"
                    >
                        <Icon as={FaMagic} mr={1} /> Generate Meals
                    </Button>
                </HStack>
                <HStack gap={2}>
                    <IconButton
                        aria-label="Queue view"
                        variant={viewMode === 'queue' ? 'solid' : 'ghost'}
                        bg={viewMode === 'queue' ? 'vscode.button' : undefined}
                        color={viewMode === 'queue' ? 'white' : 'fg.muted'}
                        _hover={{ bg: viewMode === 'queue' ? 'vscode.buttonHover' : 'whiteAlpha.100' }}
                        size="xs"
                        onClick={() => setViewMode('queue')}
                    >
                        <FaList />
                    </IconButton>
                    <IconButton
                        aria-label="Calendar view"
                        variant={viewMode === 'calendar' ? 'solid' : 'ghost'}
                        bg={viewMode === 'calendar' ? 'vscode.button' : undefined}
                        color={viewMode === 'calendar' ? 'white' : 'fg.muted'}
                        _hover={{ bg: viewMode === 'calendar' ? 'vscode.buttonHover' : 'whiteAlpha.100' }}
                        size="xs"
                        onClick={() => setViewMode('calendar')}
                    >
                        <FaCalendarAlt />
                    </IconButton>
                    <Button
                        onClick={() => setShoppingPanelOpen(true)}
                        variant="outline"
                        borderColor="vscode.accent"
                        color="vscode.accent"
                        _hover={{ bg: "whiteAlpha.100" }}
                        size="xs"
                    >
                        <Icon as={FaShoppingCart} mr={1} /> Shopping List
                    </Button>
                </HStack>
            </HStack>

            {status === 'pending' && (
                <Center p={8}>
                    <Spinner size="lg" color="vscode.accent" />
                </Center>
            )}

            {status === 'success' && meals.length === 0 && (
                <Center p={8}>
                    <VStack gap={4}>
                        <Text color="fg.muted" fontSize="lg">No upcoming meals</Text>
                        <Text color="fg.muted" fontSize="sm">
                            Add a meal or generate meals from your templates to get started.
                        </Text>
                        <HStack gap={2}>
                            <Button
                                onClick={() => navigate('/meals/new')}
                                bg="vscode.button"
                                color="white"
                                _hover={{ bg: "vscode.buttonHover" }}
                                size="sm"
                            >
                                <Icon as={FaPlus} mr={1} /> Add Meal
                            </Button>
                            <Button
                                onClick={() => setGenerateModalOpen(true)}
                                variant="outline"
                                borderColor="vscode.accent"
                                color="vscode.accent"
                                _hover={{ bg: "whiteAlpha.100" }}
                                size="sm"
                            >
                                <Icon as={FaMagic} mr={1} /> Generate Meals
                            </Button>
                        </HStack>
                    </VStack>
                </Center>
            )}

            {status === 'success' && meals.length > 0 && viewMode === 'queue' && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={meals.map(m => m.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <VStack gap={3} align="stretch">
                            {meals.map((meal) => (
                                <MealQueueCard
                                    key={meal.id}
                                    meal={meal}
                                    recipeNames={recipeNames}
                                />
                            ))}
                        </VStack>
                    </SortableContext>
                </DndContext>
            )}

            {status === 'success' && meals.length > 0 && viewMode === 'calendar' && (
                <CalendarView meals={meals} recipeNames={recipeNames} />
            )}

            <ShoppingListPanel
                isOpen={shoppingPanelOpen}
                onClose={() => setShoppingPanelOpen(false)}
                meals={meals}
                recipeNames={recipeNames}
            />

            <GenerateMealsModal
                isOpen={generateModalOpen}
                onClose={() => setGenerateModalOpen(false)}
                onGenerate={(request: MealGenerateRequest) => {
                    generateMeals.mutate(request, {
                        onSuccess: () => setGenerateModalOpen(false),
                    });
                }}
                isGenerating={generateMeals.isPending}
            />
        </Box>
    );
};

export default UpcomingMeals;
