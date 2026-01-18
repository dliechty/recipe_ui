import { Badge, Menu, Spinner, Icon, HStack } from '@chakra-ui/react';
import { FaEdit } from 'react-icons/fa';
import { MealClassification } from '../../../client';
import { useUpdateMeal } from '../../../hooks/useMeals';
import { toaster } from '../../../toaster';

interface EditableClassificationBadgeProps {
    mealId: string;
    classification?: MealClassification | null;
    canEdit: boolean;
}

const EditableClassificationBadge = ({ mealId, classification, canEdit }: EditableClassificationBadgeProps) => {
    const updateMeal = useUpdateMeal();

    if (!canEdit) {
        return <Badge colorPalette="teal">{classification || 'Unclassified'}</Badge>;
    }

    const handleSelect = (val: string) => {
        updateMeal.mutate({
            id: mealId,
            requestBody: { classification: val as MealClassification }
        }, {
            onSuccess: () => {
                toaster.create({
                    title: "Classification updated",
                    type: "success"
                });
            },
            onError: (err) => {
                toaster.create({
                    title: "Failed to update classification",
                    description: err.message,
                    type: "error"
                });
            }
        });
    };

    const isUpdating = updateMeal.isPending;
    const options = Object.values(MealClassification);

    return (
        <Menu.Root>
            <Menu.Trigger disabled={isUpdating} style={{ cursor: isUpdating ? 'wait' : 'pointer' }}>
                <HStack gap={1}>
                    <Badge colorPalette="teal">{classification || 'Add Classification'}</Badge>
                    {isUpdating ? <Spinner size="xs" /> : <Icon as={FaEdit} size="xs" color="fg.muted" opacity={0.5} _hover={{ opacity: 1 }} />}
                </HStack>
            </Menu.Trigger>
            <Menu.Positioner>
                <Menu.Content bg="vscode.surface" borderColor="vscode.border">
                    {options.map(opt => (
                        <Menu.Item 
                            key={opt} 
                            value={opt} 
                            onClick={() => handleSelect(opt)}
                            bg="vscode.surface"
                            _hover={{ bg: "vscode.inputBg" }}
                            _focus={{ bg: "vscode.inputBg" }}
                            cursor="pointer"
                            color="fg.default"
                        >
                            {opt}
                        </Menu.Item>
                    ))}
                </Menu.Content>
            </Menu.Positioner>
        </Menu.Root>
    );
};

export default EditableClassificationBadge;
