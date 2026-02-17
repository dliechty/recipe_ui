import { Box, HStack, VStack, Text, Badge, IconButton, Checkbox } from '@chakra-ui/react';
import { FaGripVertical, FaShoppingBag, FaCalendarAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Meal } from '../../../client';

interface MealQueueCardProps {
    meal: Meal;
    recipeNames: Record<string, string>;
    selectionMode?: boolean;
    isSelected?: boolean;
    onToggleSelect?: (id: string) => void;
}

const MealQueueCard = ({ meal, recipeNames, selectionMode, isSelected, onToggleSelect }: MealQueueCardProps) => {
    const navigate = useNavigate();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: meal.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 0,
        opacity: isDragging ? 0.5 : 1,
    };

    const recipeList = meal.items?.map(item => recipeNames[item.recipe_id]).filter(Boolean) || [];

    const handleClick = () => {
        if (selectionMode && onToggleSelect) {
            onToggleSelect(meal.id);
        } else {
            navigate(`/meals/${meal.id}`);
        }
    };

    return (
        <Box
            ref={setNodeRef}
            style={style}
            bg="bg.surface"
            borderWidth={1}
            borderColor={isSelected ? 'vscode.accent' : isDragging ? 'vscode.accent' : 'border.default'}
            borderRadius="lg"
            p={4}
            cursor="pointer"
            _hover={{ borderColor: 'vscode.accent', bg: 'bg.muted' }}
            onClick={handleClick}
        >
            <HStack gap={3} align="start">
                {selectionMode ? (
                    <Checkbox.Root
                        checked={!!isSelected}
                        onCheckedChange={() => onToggleSelect?.(meal.id)}
                        aria-label={`Select ${meal.name || 'Untitled'}`}
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        mt={1}
                    >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control>
                            <Checkbox.Indicator />
                        </Checkbox.Control>
                    </Checkbox.Root>
                ) : (
                    <IconButton
                        aria-label="Drag to reorder"
                        variant="ghost"
                        cursor="grab"
                        color="fg.muted"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                        {...attributes}
                        {...listeners}
                        _active={{ cursor: 'grabbing' }}
                    >
                        <FaGripVertical />
                    </IconButton>
                )}

                <VStack align="start" flex={1} gap={1}>
                    <HStack gap={2} flexWrap="wrap">
                        <Text fontWeight="semibold" color="fg.default" fontSize="md">
                            {meal.name || 'Untitled'}
                        </Text>
                        {meal.classification && (
                            <Badge colorPalette="blue" size="sm">
                                {meal.classification}
                            </Badge>
                        )}
                    </HStack>

                    <HStack gap={4} flexWrap="wrap">
                        <HStack gap={1} color="fg.muted" fontSize="sm">
                            <FaCalendarAlt size={12} />
                            <Text>
                                {meal.scheduled_date
                                    ? new Date(meal.scheduled_date).toLocaleDateString()
                                    : 'Unscheduled'}
                            </Text>
                        </HStack>

                        <HStack gap={1} fontSize="sm" color={meal.is_shopped ? 'green.400' : 'fg.muted'}>
                            <FaShoppingBag size={12} />
                            <Text>{meal.is_shopped ? 'Shopped' : 'Not Shopped'}</Text>
                        </HStack>

                        <Text fontSize="sm" color="fg.muted">
                            {meal.items?.length || 0} recipe{meal.items?.length === 1 ? '' : 's'}
                        </Text>
                    </HStack>

                    <Text fontSize="xs" color="fg.muted" lineClamp={1} minH="1.2em">
                        {recipeList.length > 0 ? recipeList.join(', ') : '\u00A0'}
                    </Text>
                </VStack>
            </HStack>
        </Box>
    );
};

export default MealQueueCard;
