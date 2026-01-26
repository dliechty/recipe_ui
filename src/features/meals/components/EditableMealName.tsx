import { useState, useEffect } from 'react';
import { Heading, Input, IconButton, HStack, Icon, Spinner } from '@chakra-ui/react';
import { FaCheck, FaTimes, FaEdit } from 'react-icons/fa';
import { useUpdateMeal } from '../../../hooks/useMeals';
import { toaster } from '../../../toaster';

interface EditableMealNameProps {
    mealId: string;
    initialName: string;
    canEdit: boolean;
}

const EditableMealName = ({ mealId, initialName, canEdit }: EditableMealNameProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(initialName);
    const updateMeal = useUpdateMeal();

    useEffect(() => {
        setName(initialName);
    }, [initialName]);

    const handleSave = () => {
        if (!name.trim()) return;

        updateMeal.mutate({
            id: mealId,
            requestBody: { name: name.trim() }
        }, {
            onSuccess: () => {
                setIsEditing(false);
                toaster.create({
                    title: "Meal name updated",
                    type: "success"
                });
            },
            onError: (err) => {
                toaster.create({
                    title: "Failed to update meal name",
                    description: err.message,
                    type: "error"
                });
            }
        });
    };

    const handleCancel = () => {
        setName(initialName);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    if (isEditing) {
        return (
            <HStack gap={2}>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    size="lg"
                    fontWeight="bold"
                    variant="outline"
                />
                <IconButton
                    aria-label="Save"
                    size="sm"
                    colorPalette="green"
                    onClick={handleSave}
                    disabled={updateMeal.isPending}
                >
                    {updateMeal.isPending ? <Spinner size="xs" /> : <FaCheck />}
                </IconButton>
                <IconButton
                    aria-label="Cancel"
                    size="sm"
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

    return (
        <HStack
            gap={2}
            align="center"
            cursor={canEdit ? "pointer" : "default"}
            onClick={() => canEdit && setIsEditing(true)}
            _hover={{ '& .edit-icon': { opacity: 1 } }}
        >
            <Heading size="lg">{name || 'Untitled Meal'}</Heading>
            {canEdit && (
                <Icon
                    as={FaEdit}
                    className="edit-icon"
                    color="fg.muted"
                    opacity={0}
                    transition="opacity 0.2s"
                    boxSize={4}
                />
            )}
        </HStack>
    );
};

export default EditableMealName;
