import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Box, VStack, HStack, Text, IconButton, Button, Badge, Grid, GridItem } from '@chakra-ui/react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {
    DndContext,
    DragOverlay,
    useDraggable,
    useDroppable,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { Meal, MealUpdate } from '../../../client';

interface CalendarViewProps {
    meals: Meal[];
    recipeNames: Record<string, string>;
    onMealUpdate?: (mealId: string, update: MealUpdate) => void;
}

const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
};

const formatDateHeader = (date: Date): string => {
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

// --- Sub-components for DnD ---

interface DraggableMealCardProps {
    meal: Meal;
    recipeNames: Record<string, string>;
    onClick: () => void;
}

const DraggableMealCard = ({ meal, recipeNames, onClick }: DraggableMealCardProps) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: meal.id,
    });

    return (
        <Box
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            p={1}
            borderRadius="sm"
            bg="whiteAlpha.100"
            cursor="grab"
            opacity={isDragging ? 0.4 : 1}
            _hover={{ bg: 'whiteAlpha.200' }}
            onClick={onClick}
        >
            <Text fontSize="xs" fontWeight="medium" color="fg.default" lineClamp={1}>
                {meal.name || 'Untitled'}
            </Text>
            {meal.items?.length > 0 && (
                <Text fontSize="2xs" color="fg.muted" lineClamp={1}>
                    {meal.items.map(item => recipeNames[item.recipe_id] || '...').join(', ')}
                </Text>
            )}
            {meal.classification && (
                <Badge size="sm" colorPalette="blue" fontSize="2xs">
                    {meal.classification}
                </Badge>
            )}
        </Box>
    );
};

interface DroppableDaySlotProps {
    dateStr: string;
    isToday: boolean;
    dayLabel: string;
    children: React.ReactNode;
}

const DroppableDaySlot = ({ dateStr, isToday, dayLabel, children }: DroppableDaySlotProps) => {
    const { setNodeRef, isOver } = useDroppable({
        id: dateStr,
    });

    return (
        <GridItem
            ref={setNodeRef}
            data-testid={`calendar-day-${dateStr}`}
            borderWidth={isOver ? 2 : 1}
            borderColor={isOver ? 'green.400' : isToday ? 'vscode.accent' : 'border.default'}
            borderRadius="md"
            bg={isOver ? 'whiteAlpha.100' : isToday ? 'whiteAlpha.50' : 'bg.surface'}
            minH="120px"
            transition="border-color 0.15s, background 0.15s"
        >
            <Box
                px={2}
                py={1}
                borderBottomWidth={1}
                borderColor="border.default"
                bg={isToday ? 'whiteAlpha.100' : undefined}
            >
                <Text
                    fontSize="xs"
                    fontWeight={isToday ? 'bold' : 'medium'}
                    color={isToday ? 'vscode.accent' : 'fg.muted'}
                >
                    {dayLabel}
                </Text>
            </Box>
            <VStack p={1} gap={1} align="stretch">
                {children}
            </VStack>
        </GridItem>
    );
};

interface DroppableUnscheduledAreaProps {
    children: React.ReactNode;
}

const DroppableUnscheduledArea = ({ children }: DroppableUnscheduledAreaProps) => {
    const { setNodeRef, isOver } = useDroppable({
        id: 'unscheduled',
    });

    return (
        <Box
            ref={setNodeRef}
            data-testid="calendar-unscheduled"
            borderWidth={isOver ? 2 : 1}
            borderColor={isOver ? 'green.400' : 'border.default'}
            borderRadius="md"
            p={3}
            bg={isOver ? 'whiteAlpha.100' : undefined}
            transition="border-color 0.15s, background 0.15s"
        >
            <Text fontSize="sm" fontWeight="semibold" color="fg.default" mb={2}>
                Unscheduled
            </Text>
            <HStack gap={2} flexWrap="wrap">
                {children}
            </HStack>
        </Box>
    );
};

// --- Drag overlay card (simplified visual) ---

const DragOverlayCard = ({ meal }: { meal: Meal }) => (
    <Box
        p={2}
        borderRadius="md"
        bg="bg.surface"
        borderWidth={1}
        borderColor="vscode.accent"
        boxShadow="lg"
        opacity={0.9}
        maxW="200px"
    >
        <Text fontSize="xs" fontWeight="medium" color="fg.default" lineClamp={1}>
            {meal.name || 'Untitled'}
        </Text>
        {meal.classification && (
            <Badge size="sm" colorPalette="blue" fontSize="2xs">
                {meal.classification}
            </Badge>
        )}
    </Box>
);

// --- Main component ---

const CalendarView = ({ meals, recipeNames, onMealUpdate }: CalendarViewProps) => {
    const navigate = useNavigate();
    const [weekStart, setWeekStart] = useState(() => getStartOfWeek(new Date()));
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const [pendingMoves, setPendingMoves] = useState<Map<string, string | null>>(new Map());
    const prevMealsRef = useRef(meals);

    // Clear pending moves when meals prop changes (server data arrived)
    useEffect(() => {
        if (prevMealsRef.current !== meals) {
            prevMealsRef.current = meals;
            setPendingMoves(new Map());
        }
    }, [meals]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor)
    );

    const weekDays = useMemo(() => {
        const days: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + i);
            days.push(d);
        }
        return days;
    }, [weekStart]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Apply optimistic overrides to meals
    const optimisticMeals = useMemo(() => {
        if (pendingMoves.size === 0) return meals;
        return meals.map(meal => {
            if (pendingMoves.has(meal.id)) {
                return { ...meal, scheduled_date: pendingMoves.get(meal.id) ?? null };
            }
            return meal;
        });
    }, [meals, pendingMoves]);

    const mealsByDate = useMemo(() => {
        const map = new Map<string, Meal[]>();
        optimisticMeals.forEach(meal => {
            if (meal.scheduled_date) {
                const existing = map.get(meal.scheduled_date) || [];
                existing.push(meal);
                map.set(meal.scheduled_date, existing);
            }
        });
        return map;
    }, [optimisticMeals]);

    const mealsById = useMemo(() => {
        const map = new Map<string, Meal>();
        optimisticMeals.forEach(meal => map.set(meal.id, meal));
        return map;
    }, [optimisticMeals]);

    const unscheduledMeals = useMemo(() =>
        optimisticMeals.filter(m => !m.scheduled_date),
        [optimisticMeals]
    );

    const handlePrevWeek = () => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() - 7);
        setWeekStart(d);
    };

    const handleNextWeek = () => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + 7);
        setWeekStart(d);
    };

    const handleToday = () => {
        setWeekStart(getStartOfWeek(new Date()));
    };

    const handleDragStart = useCallback((event: { active: { id: string | number } }) => {
        setActiveDragId(String(event.active.id));
    }, []);

    const handleDragEnd = useCallback((event: { active: { id: string | number }; over: { id: string | number } | null }) => {
        const { active, over } = event;
        if (!over) {
            setActiveDragId(null);
            return;
        }

        const mealId = String(active.id);
        const targetId = String(over.id);
        const meal = mealsById.get(mealId);
        if (!meal) {
            setActiveDragId(null);
            return;
        }

        const currentDate = meal.scheduled_date || null;

        if (targetId === 'unscheduled') {
            // Dropping on unscheduled area: clear scheduled_date
            if (currentDate === null) {
                setActiveDragId(null);
                return; // Already unscheduled, no-op
            }
            // Apply optimistic move FIRST, then clear drag state, then notify parent
            setPendingMoves(prev => new Map(prev).set(mealId, null));
            setActiveDragId(null);
            onMealUpdate?.(mealId, { scheduled_date: null });
        } else {
            // Dropping on a day slot: targetId is a date string
            if (currentDate === targetId) {
                setActiveDragId(null);
                return; // Same day, no-op
            }
            // Apply optimistic move FIRST, then clear drag state, then notify parent
            setPendingMoves(prev => new Map(prev).set(mealId, targetId));
            setActiveDragId(null);
            onMealUpdate?.(mealId, { scheduled_date: targetId });
        }
    }, [mealsById, onMealUpdate]);

    const activeMeal = activeDragId ? mealsById.get(activeDragId) : null;

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <VStack align="stretch" gap={4}>
                {/* Navigation */}
                <HStack justifyContent="space-between">
                    <HStack gap={2}>
                        <IconButton
                            aria-label="Previous week"
                            variant="ghost"
                            size="sm"
                            color="fg.muted"
                            _hover={{ color: "fg.default" }}
                            onClick={handlePrevWeek}
                        >
                            <FaChevronLeft />
                        </IconButton>
                        <Button
                            variant="ghost"
                            size="sm"
                            color="vscode.accent"
                            onClick={handleToday}
                        >
                            Today
                        </Button>
                        <IconButton
                            aria-label="Next week"
                            variant="ghost"
                            size="sm"
                            color="fg.muted"
                            _hover={{ color: "fg.default" }}
                            onClick={handleNextWeek}
                        >
                            <FaChevronRight />
                        </IconButton>
                    </HStack>
                    <Text fontSize="sm" color="fg.muted">
                        {weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – {weekEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                </HStack>

                {/* Week Grid */}
                <Grid templateColumns={{ base: '1fr', md: 'repeat(7, 1fr)' }} gap={2}>
                    {weekDays.map(day => {
                        const dateStr = day.toISOString().split('T')[0];
                        const dayMeals = mealsByDate.get(dateStr) || [];
                        const isToday = day.getTime() === today.getTime();

                        return (
                            <DroppableDaySlot
                                key={dateStr}
                                dateStr={dateStr}
                                isToday={isToday}
                                dayLabel={formatDateHeader(day)}
                            >
                                {dayMeals.map(meal => (
                                    <DraggableMealCard
                                        key={meal.id}
                                        meal={meal}
                                        recipeNames={recipeNames}
                                        onClick={() => navigate(`/meals/${meal.id}`, { state: { fromView: 'calendar' } })}
                                    />
                                ))}
                            </DroppableDaySlot>
                        );
                    })}
                </Grid>

                {/* Unscheduled meals - always show the droppable area */}
                <DroppableUnscheduledArea>
                    {unscheduledMeals.map(meal => (
                        <DraggableMealCard
                            key={meal.id}
                            meal={meal}
                            recipeNames={recipeNames}
                            onClick={() => navigate(`/meals/${meal.id}`, { state: { fromView: 'calendar' } })}
                        />
                    ))}
                    {unscheduledMeals.length === 0 && (
                        <Text fontSize="sm" color="fg.muted">Drop meals here to unschedule</Text>
                    )}
                </DroppableUnscheduledArea>
            </VStack>

            <DragOverlay>
                {activeMeal ? <DragOverlayCard meal={activeMeal} /> : null}
            </DragOverlay>
        </DndContext>
    );
};

export default CalendarView;
