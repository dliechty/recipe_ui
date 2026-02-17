import { useState, useEffect } from 'react';
import { Text, Input, IconButton, HStack, Icon, Spinner, Button } from '@chakra-ui/react';
import { FaCheck, FaTimes, FaEdit, FaCalendarAlt } from 'react-icons/fa';
import { useUpdateMeal } from '../../../hooks/useMeals';
import { toaster } from '../../../toaster';
import { parseLocalDate } from '../../../utils/formatters';

interface EditableMealDateProps {
    mealId: string;
    date: string | null | undefined;
    canEdit: boolean;
}

const EditableMealDate = ({ mealId, date, canEdit }: EditableMealDateProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentDate, setCurrentDate] = useState(date || '');
    const updateMeal = useUpdateMeal();

    useEffect(() => {
        setCurrentDate(date || '');
    }, [date]);

    const handleSave = () => {
        const dateToSend = currentDate.trim() === '' ? null : currentDate.trim();

        updateMeal.mutate({
            id: mealId,
            requestBody: { scheduled_date: dateToSend }
        }, {
            onSuccess: () => {
                setIsEditing(false);
                toaster.create({
                    title: "Meal date updated",
                    type: "success"
                });
            },
            onError: (err) => {
                toaster.create({
                    title: "Failed to update meal date",
                    description: err.message,
                    type: "error"
                });
            }
        });
    };

    const handleCancel = () => {
        setCurrentDate(date || '');
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    const getDisplayDate = () => {
        if (!date) return 'Set Date';
        return parseLocalDate(date).toLocaleDateString();
    };

    if (isEditing) {
        return (
            <HStack gap={2}>
                <Input
                    type="date"
                    value={currentDate}
                    onChange={(e) => setCurrentDate(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    size="sm"
                    width="auto"
                    bg="vscode.inputBg"
                    borderColor="border.default"
                    color="fg.default"
                    _hover={{ borderColor: 'vscode.accent' }}
                    _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                    css={{ colorScheme: 'dark' }}
                />
                <IconButton
                    aria-label="Save"
                    size="xs"
                    colorPalette="green"
                    onClick={handleSave}
                    disabled={updateMeal.isPending}
                >
                    {updateMeal.isPending ? <Spinner size="xs" /> : <FaCheck />}
                </IconButton>
                <IconButton
                    aria-label="Cancel"
                    size="xs"
                    bg="button.secondary"
                    color="white"
                    _hover={{ bg: "button.secondaryHover" }}
                    onClick={handleCancel}
                    disabled={updateMeal.isPending}
                >
                    <FaTimes />
                </IconButton>
            </HStack>
        );
    }

    const displayDate = getDisplayDate();
    const isSet = !!date;

    if (!canEdit && !isSet) {
        return <Text fontSize="sm" color="fg.muted">Not set</Text>;
    }

    if (!canEdit) {
        return <Text fontSize="sm">{displayDate}</Text>;
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            height="auto"
            py={0}
            px={0}
            minW={0}
            justifyContent="start"
            fontWeight="normal"
            onClick={() => setIsEditing(true)}
            gap={2}
            _hover={{ bg: 'transparent', '& svg': { opacity: 1 } }}
        >
            <Text fontSize="sm" color={isSet ? "fg.default" : "fg.muted"} fontStyle={isSet ? "normal" : "italic"}>
                {displayDate}
            </Text>
            <Icon
                as={isSet ? FaEdit : FaCalendarAlt}
                color="fg.muted"
                opacity={0.5}
                transition="opacity 0.2s"
                boxSize={3}
            />
        </Button>
    );
};

export default EditableMealDate;
