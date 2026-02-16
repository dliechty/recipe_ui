import { Badge, Menu, Spinner, Icon, HStack } from '@chakra-ui/react';
import { FaEdit } from 'react-icons/fa';
import { MealStatus } from '../../../client';
import { useUpdateMeal } from '../../../hooks/useMeals';
import { toaster } from '../../../toaster';

interface EditableStatusBadgeProps {
    mealId: string;
    status: MealStatus;
    canEdit: boolean;
}

const statusColor = (status: MealStatus) => {
    switch (status) {
        case 'Cooked': return 'green';
        case 'Cancelled': return 'red';
        default: return 'gray'; // Queued
    }
};

const EditableStatusBadge = ({ mealId, status, canEdit }: EditableStatusBadgeProps) => {
    const updateMeal = useUpdateMeal();

    if (!canEdit) {
        return <Badge colorPalette={statusColor(status)}>{status}</Badge>;
    }

    const handleSelect = (newStatus: string) => {
        updateMeal.mutate({
            id: mealId,
            requestBody: { status: newStatus as MealStatus }
        }, {
            onSuccess: () => {
                toaster.create({
                    title: "Status updated",
                    type: "success"
                });
            },
            onError: (err) => {
                toaster.create({
                    title: "Failed to update status",
                    description: err.message,
                    type: "error"
                });
            }
        });
    };

    const isUpdating = updateMeal.isPending;

    return (
        <Menu.Root>
            <Menu.Trigger disabled={isUpdating} style={{ cursor: isUpdating ? 'wait' : 'pointer' }}>
                <HStack gap={1}>
                    <Badge colorPalette={statusColor(status)}>{status}</Badge>
                    {isUpdating ? <Spinner size="xs" /> : <Icon as={FaEdit} size="xs" color="fg.muted" opacity={0.5} _hover={{ opacity: 1 }} />}
                </HStack>
            </Menu.Trigger>
            <Menu.Positioner>
                <Menu.Content bg="vscode.surface" borderColor="vscode.border">
                    {(['Queued', 'Cooked', 'Cancelled'] as MealStatus[]).map((s) => (
                        <Menu.Item
                            key={s}
                            value={s}
                            onClick={() => handleSelect(s)}
                            bg="vscode.surface"
                            _hover={{ bg: "vscode.inputBg" }}
                            _focus={{ bg: "vscode.inputBg" }}
                            cursor="pointer"
                        >
                            <Badge colorPalette={statusColor(s)}>{s}</Badge>
                        </Menu.Item>
                    ))}
                </Menu.Content>
            </Menu.Positioner>
        </Menu.Root>
    );
};

export default EditableStatusBadge;
