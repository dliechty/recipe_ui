import { useState, useMemo } from 'react';
import { Box, VStack, HStack, Text, IconButton, Button, Badge, Grid, GridItem } from '@chakra-ui/react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Meal } from '../../../client';

interface CalendarViewProps {
    meals: Meal[];
    recipeNames: Record<string, string>;
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

const CalendarView = ({ meals, recipeNames }: CalendarViewProps) => {
    const navigate = useNavigate();
    const [weekStart, setWeekStart] = useState(() => getStartOfWeek(new Date()));

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

    const mealsByDate = useMemo(() => {
        const map = new Map<string, Meal[]>();
        meals.forEach(meal => {
            if (meal.scheduled_date) {
                const existing = map.get(meal.scheduled_date) || [];
                existing.push(meal);
                map.set(meal.scheduled_date, existing);
            }
        });
        return map;
    }, [meals]);

    const unscheduledMeals = useMemo(() =>
        meals.filter(m => !m.scheduled_date),
        [meals]
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

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    return (
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
                        <GridItem
                            key={dateStr}
                            data-testid={`calendar-day-${dateStr}`}
                            borderWidth={1}
                            borderColor={isToday ? 'vscode.accent' : 'border.default'}
                            borderRadius="md"
                            bg={isToday ? 'whiteAlpha.50' : 'bg.surface'}
                            minH="120px"
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
                                    {formatDateHeader(day)}
                                </Text>
                            </Box>
                            <VStack p={1} gap={1} align="stretch">
                                {dayMeals.map(meal => (
                                    <Box
                                        key={meal.id}
                                        p={1}
                                        borderRadius="sm"
                                        bg="whiteAlpha.100"
                                        cursor="pointer"
                                        _hover={{ bg: 'whiteAlpha.200' }}
                                        onClick={() => navigate(`/meals/${meal.id}`)}
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
                                ))}
                            </VStack>
                        </GridItem>
                    );
                })}
            </Grid>

            {/* Unscheduled meals */}
            {unscheduledMeals.length > 0 && (
                <Box borderWidth={1} borderColor="border.default" borderRadius="md" p={3}>
                    <Text fontSize="sm" fontWeight="semibold" color="fg.default" mb={2}>
                        Unscheduled
                    </Text>
                    <HStack gap={2} flexWrap="wrap">
                        {unscheduledMeals.map(meal => (
                            <Box
                                key={meal.id}
                                px={3}
                                py={1}
                                borderRadius="md"
                                bg="whiteAlpha.100"
                                cursor="pointer"
                                _hover={{ bg: 'whiteAlpha.200' }}
                                onClick={() => navigate(`/meals/${meal.id}`)}
                            >
                                <Text fontSize="sm" color="fg.default">{meal.name || 'Untitled'}</Text>
                            </Box>
                        ))}
                    </HStack>
                </Box>
            )}
        </VStack>
    );
};

export default CalendarView;
