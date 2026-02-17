import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, VStack, Text, Button, Icon, IconButton, Spinner, Center, HStack, Checkbox } from '@chakra-ui/react';
import { FaPlus, FaMagic, FaShoppingCart, FaList, FaCalendarAlt, FaCheckSquare, FaSortAmountDown } from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useInfiniteMeals, useBulkUpdateMeals, useUpdateMeal, useGenerateMeals } from '../../../hooks/useMeals';
import { useInfiniteRecipes } from '../../../hooks/useRecipes';
import { useAuth } from '../../../context/AuthContext';
import { MealStatus, MealGenerateRequest, Meal, MealUpdate } from '../../../client';
import MealQueueCard from './MealQueueCard';
import GenerateMealsModal from './GenerateMealsModal';
import ShoppingListPanel from './ShoppingListPanel';
import CalendarView from './CalendarView';
import ErrorAlert from '../../../components/common/ErrorAlert';
import { toaster } from '../../../toaster';

const UpcomingMeals = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuth();
    const bulkUpdate = useBulkUpdateMeals();
    const bulkStatusUpdate = useBulkUpdateMeals();
    const updateMeal = useUpdateMeal();
    const generateMeals = useGenerateMeals();
    const [generateModalOpen, setGenerateModalOpen] = useState(false);
    const [shoppingPanelOpen, setShoppingPanelOpen] = useState(false);
    const viewMode = searchParams.get('view') === 'calendar' ? 'calendar' : 'queue';
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [sortMode, setSortMode] = useState<'queue_position' | 'scheduled_date'>('queue_position');

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

    const serverMeals = useMemo(() =>
        data?.pages.flatMap((page) => page.meals) || [],
        [data]
    );

    // Local order state that dnd-kit controls directly.
    // After a drag reorder, server syncs are blocked until the server data
    // reflects the new order, preventing stale data from flickering through.
    const [localMeals, setLocalMeals] = useState<Meal[]>([]);
    const reorderPendingRef = useRef(false);
    useEffect(() => {
        if (reorderPendingRef.current) {
            // Only accept server data once it matches the local order
            const serverIds = serverMeals.map(m => m.id).join(',');
            const localIds = localMeals.map(m => m.id).join(',');
            if (serverIds === localIds) {
                reorderPendingRef.current = false;
                setLocalMeals(serverMeals);
            }
            return;
        }
        setLocalMeals(serverMeals);
    }, [serverMeals]); // eslint-disable-line react-hooks/exhaustive-deps

    // Use local order for rendering; fall back to server data if local is empty
    const meals = localMeals.length > 0 ? localMeals : serverMeals;

    // Client-side sort for date mode: unscheduled first (by queue_position), then scheduled by date ascending
    const sortedMeals = useMemo(() => {
        if (sortMode !== 'scheduled_date') return meals;

        const unscheduled = meals.filter(m => !m.scheduled_date);
        const scheduled = meals.filter(m => m.scheduled_date);

        scheduled.sort((a, b) => {
            const dateA = a.scheduled_date || '';
            const dateB = b.scheduled_date || '';
            return dateA.localeCompare(dateB);
        });

        return [...unscheduled, ...scheduled];
    }, [meals, sortMode]);

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

    const recipes = useMemo(() =>
        recipesData?.pages.flatMap(p => p.recipes) || [],
        [recipesData]
    );

    const recipeNames = useMemo(() => {
        const map: Record<string, string> = {};
        recipes.forEach(r => {
            map[r.core.id] = r.core.name;
        });
        return map;
    }, [recipes]);

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

        // Use arrayMove (same algorithm dnd-kit uses internally) and
        // update local state immediately so the list stays in place.
        // Block server syncs until server data catches up.
        const reordered = arrayMove(meals, oldIndex, newIndex);
        reorderPendingRef.current = true;
        setLocalMeals(reordered);

        // Persist new queue_position values to the server
        const updates = reordered.map((meal, idx) => ({
            id: meal.id,
            requestBody: { queue_position: idx },
        }));

        bulkUpdate.mutate(updates);
    };

    const handleToggleSelect = useCallback((id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        if (selectedIds.size === meals.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(meals.map(m => m.id)));
        }
    }, [meals, selectedIds.size]);

    const handleExitSelectionMode = useCallback(() => {
        setSelectionMode(false);
        setSelectedIds(new Set());
    }, []);

    const handleMealUpdate = useCallback((mealId: string, requestBody: MealUpdate) => {
        updateMeal.mutate({ id: mealId, requestBody });
    }, [updateMeal]);

    const handleBulkAction = useCallback((requestBody: MealUpdate) => {
        const updates = Array.from(selectedIds).map(id => ({
            id,
            requestBody,
        }));
        bulkStatusUpdate.mutate(updates, {
            onSuccess: () => {
                toaster.create({
                    title: 'Success',
                    description: `Updated ${updates.length} meal${updates.length === 1 ? '' : 's'} successfully.`,
                    type: 'success',
                });
                setSelectedIds(new Set());
                setSelectionMode(false);
            },
            onError: (error) => {
                toaster.create({
                    title: 'Error',
                    description: error.message || 'Failed to update meals.',
                    type: 'error',
                });
            },
        });
    }, [selectedIds, bulkStatusUpdate]);

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
                    {!selectionMode && meals.length > 0 && (
                        <Button
                            onClick={() => setSelectionMode(true)}
                            variant="outline"
                            borderColor="vscode.accent"
                            color="vscode.accent"
                            _hover={{ bg: "whiteAlpha.100" }}
                            size="xs"
                        >
                            <Icon as={FaCheckSquare} mr={1} /> Select
                        </Button>
                    )}
                    {selectionMode && (
                        <>
                            <Checkbox.Root
                                checked={meals.length > 0 && selectedIds.size === meals.length}
                                onCheckedChange={handleSelectAll}
                                aria-label="Select all"
                            >
                                <Checkbox.HiddenInput />
                                <Checkbox.Control>
                                    <Checkbox.Indicator />
                                </Checkbox.Control>
                            </Checkbox.Root>
                            <Text color="fg.muted" fontSize="sm">
                                {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
                            </Text>
                            <Button
                                onClick={handleExitSelectionMode}
                                variant="ghost"
                                color="fg.muted"
                                _hover={{ bg: "whiteAlpha.100" }}
                                size="xs"
                            >
                                Cancel
                            </Button>
                        </>
                    )}
                    {viewMode === 'queue' && meals.length > 0 && (
                        <Button
                            onClick={() => setSortMode(prev => prev === 'queue_position' ? 'scheduled_date' : 'queue_position')}
                            variant={sortMode === 'scheduled_date' ? 'solid' : 'outline'}
                            bg={sortMode === 'scheduled_date' ? 'vscode.button' : undefined}
                            borderColor="vscode.accent"
                            color={sortMode === 'scheduled_date' ? 'white' : 'vscode.accent'}
                            _hover={{ bg: sortMode === 'scheduled_date' ? 'vscode.buttonHover' : 'whiteAlpha.100' }}
                            size="xs"
                        >
                            <Icon as={FaSortAmountDown} mr={1} />
                            {sortMode === 'scheduled_date' ? 'Sort by Position' : 'Sort by Date'}
                        </Button>
                    )}
                    <IconButton
                        aria-label="Queue view"
                        variant={viewMode === 'queue' ? 'solid' : 'ghost'}
                        bg={viewMode === 'queue' ? 'vscode.button' : undefined}
                        color={viewMode === 'queue' ? 'white' : 'fg.muted'}
                        _hover={{ bg: viewMode === 'queue' ? 'vscode.buttonHover' : 'whiteAlpha.100' }}
                        size="xs"
                        onClick={() => setSearchParams(prev => { prev.delete('view'); return prev; })}
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
                        onClick={() => setSearchParams(prev => { prev.set('view', 'calendar'); return prev; })}
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

            {status === 'success' && meals.length > 0 && viewMode === 'queue' && sortMode === 'queue_position' && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={sortedMeals.map(m => m.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <VStack gap={3} align="stretch">
                            {sortedMeals.map((meal) => (
                                <MealQueueCard
                                    key={meal.id}
                                    meal={meal}
                                    recipeNames={recipeNames}
                                    selectionMode={selectionMode}
                                    isSelected={selectedIds.has(meal.id)}
                                    onToggleSelect={handleToggleSelect}
                                />
                            ))}
                        </VStack>
                    </SortableContext>
                </DndContext>
            )}

            {status === 'success' && meals.length > 0 && viewMode === 'queue' && sortMode === 'scheduled_date' && (
                <VStack gap={3} align="stretch">
                    {sortedMeals.map((meal) => (
                        <MealQueueCard
                            key={meal.id}
                            meal={meal}
                            recipeNames={recipeNames}
                            selectionMode={selectionMode}
                            isSelected={selectedIds.has(meal.id)}
                            onToggleSelect={handleToggleSelect}
                            hideDragHandle
                        />
                    ))}
                </VStack>
            )}

            {status === 'success' && meals.length > 0 && viewMode === 'calendar' && (
                <CalendarView meals={meals} recipeNames={recipeNames} onMealUpdate={handleMealUpdate} />
            )}

            {selectionMode && selectedIds.size > 0 && (
                <Box
                    position="fixed"
                    bottom={4}
                    left="50%"
                    transform="translateX(-50%)"
                    bg="bg.surface"
                    borderWidth={1}
                    borderColor="vscode.accent"
                    borderRadius="lg"
                    p={3}
                    zIndex={100}
                    boxShadow="lg"
                >
                    <HStack gap={2} flexWrap="wrap" justifyContent="center">
                        <Text color="fg.muted" fontSize="sm" fontWeight="semibold">
                            {selectedIds.size} selected
                        </Text>
                        <Button
                            onClick={() => handleBulkAction({ status: MealStatus.COOKED })}
                            bg="green.600"
                            color="white"
                            _hover={{ bg: "green.500" }}
                            size="xs"
                            loading={bulkStatusUpdate.isPending}
                        >
                            Mark Cooked
                        </Button>
                        <Button
                            onClick={() => handleBulkAction({ status: MealStatus.CANCELLED })}
                            bg="red.600"
                            color="white"
                            _hover={{ bg: "red.500" }}
                            size="xs"
                            loading={bulkStatusUpdate.isPending}
                        >
                            Mark Cancelled
                        </Button>
                        <Button
                            onClick={() => handleBulkAction({ is_shopped: true })}
                            variant="outline"
                            borderColor="green.400"
                            color="green.400"
                            _hover={{ bg: "whiteAlpha.100" }}
                            size="xs"
                            loading={bulkStatusUpdate.isPending}
                        >
                            Mark Shopped
                        </Button>
                        <Button
                            onClick={() => handleBulkAction({ is_shopped: false })}
                            variant="outline"
                            borderColor="fg.muted"
                            color="fg.muted"
                            _hover={{ bg: "whiteAlpha.100" }}
                            size="xs"
                            loading={bulkStatusUpdate.isPending}
                        >
                            Mark Unshopped
                        </Button>
                    </HStack>
                </Box>
            )}

            <ShoppingListPanel
                isOpen={shoppingPanelOpen}
                onClose={() => setShoppingPanelOpen(false)}
                meals={meals}
                recipes={recipes}
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
