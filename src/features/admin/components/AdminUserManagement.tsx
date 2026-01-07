import React, { useEffect, useState } from 'react';
import {
    Box,
    Heading,
    Table,
    HStack,
    IconButton,
    Tooltip,
    Input,
    Checkbox
} from '@chakra-ui/react';
import { AuthenticationService, UserPublic, UserUpdate } from '../../../client';
import { toaster } from '../../../toaster';
import { FaTrash, FaKey, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const AdminUserManagement = () => {
    const [users, setUsers] = useState<UserPublic[]>([]);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<UserUpdate>({});

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await AuthenticationService.listActiveUsersAuthUsersGet();
            setUsers(data);
        } catch {
            toaster.create({
                title: "Failed to fetch users",
                type: "error",
            });
        }
    };

    const handleDelete = async (userId: string) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await AuthenticationService.deleteUserAuthUsersUserIdDelete(userId);
            toaster.create({ title: "User deleted", type: "success" });
            fetchUsers();
        } catch {
            toaster.create({ title: "Failed to delete user", type: "error" });
        }
    };

    const handleReset = async (userId: string) => {
        const password = window.prompt("Enter new temporary password:");
        if (!password) return;

        try {
            await AuthenticationService.resetUserAuthUsersUserIdResetPost(userId, { initial_password: password });
            toaster.create({ title: "User reset", type: "success" });
        } catch {
            toaster.create({ title: "Failed to reset user", type: "error" });
        }
    };

    const handleEdit = (user: UserPublic) => {
        setEditingUserId(user.id);
        setEditFormData({
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            is_admin: user.is_admin
        });
    };

    const handleCancelEstimate = () => {
        setEditingUserId(null);
        setEditFormData({});
    };

    const handleSave = async (userId: string) => {
        try {
            await AuthenticationService.updateUserAuthUsersUserIdPut(userId, editFormData);
            toaster.create({ title: "User updated", type: "success" });
            setEditingUserId(null);
            fetchUsers();
        } catch {
            toaster.create({ title: "Failed to update user", type: "error" });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <Box>
            <Heading size="md" mb={4} color="fg.default">User Management</Heading>
            <Box borderRadius="xl" overflowX="auto" borderWidth="1px" borderColor="border.default">
                <Table.Root minW="800px">
                    <Table.Header>
                        <Table.Row bg="bg.surface">
                            <Table.ColumnHeader color="fg.default">Email</Table.ColumnHeader>
                            <Table.ColumnHeader color="fg.default">First Name</Table.ColumnHeader>
                            <Table.ColumnHeader color="fg.default">Last Name</Table.ColumnHeader>
                            <Table.ColumnHeader color="fg.default">Admin</Table.ColumnHeader>
                            <Table.ColumnHeader color="fg.default">ID</Table.ColumnHeader>
                            <Table.ColumnHeader color="fg.default">Actions</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {users.map((user) => {
                            const isEditing = editingUserId === user.id;
                            return (
                                <Table.Row key={user.id} bg="bg.surface" color="fg.default" _hover={{ bg: "bg.muted" }}>
                                    <Table.Cell borderColor="border.default">
                                        {isEditing ? (
                                            <Input
                                                name="email"
                                                value={editFormData.email || ''}
                                                onChange={handleInputChange}
                                                size="sm"
                                            />
                                        ) : (
                                            user.email
                                        )}
                                    </Table.Cell>
                                    <Table.Cell borderColor="border.default">
                                        {isEditing ? (
                                            <Input
                                                name="first_name"
                                                value={editFormData.first_name || ''}
                                                onChange={handleInputChange}
                                                size="sm"
                                            />
                                        ) : (
                                            user.first_name
                                        )}
                                    </Table.Cell>
                                    <Table.Cell borderColor="border.default">
                                        {isEditing ? (
                                            <Input
                                                name="last_name"
                                                value={editFormData.last_name || ''}
                                                onChange={handleInputChange}
                                                size="sm"
                                            />
                                        ) : (
                                            user.last_name
                                        )}
                                    </Table.Cell>
                                    <Table.Cell borderColor="border.default">
                                        {isEditing ? (
                                            <Checkbox.Root
                                                checked={!!editFormData.is_admin}
                                                onCheckedChange={(e) => setEditFormData(prev => ({ ...prev, is_admin: !!e.checked }))}
                                            >
                                                <Checkbox.HiddenInput />
                                                <Checkbox.Control>
                                                    <Checkbox.Indicator />
                                                </Checkbox.Control>
                                            </Checkbox.Root>
                                        ) : (
                                            user.is_admin ? "Yes" : "No"
                                        )}
                                    </Table.Cell>
                                    <Table.Cell borderColor="border.default">{user.id}</Table.Cell>
                                    <Table.Cell borderColor="border.default">
                                        <HStack>
                                            {isEditing ? (
                                                <>
                                                    <IconButton
                                                        aria-label="Save"
                                                        size="sm"
                                                        colorPalette="green"
                                                        onClick={() => handleSave(user.id)}
                                                    >
                                                        <FaSave />
                                                    </IconButton>
                                                    <IconButton
                                                        aria-label="Cancel"
                                                        size="sm"
                                                        colorPalette="gray"
                                                        onClick={handleCancelEstimate}
                                                    >
                                                        <FaTimes />
                                                    </IconButton>
                                                </>
                                            ) : (
                                                <>
                                                    <Tooltip.Root>
                                                        <Tooltip.Trigger asChild>
                                                            <IconButton
                                                                aria-label="Edit User"
                                                                size="sm"
                                                                colorPalette="blue"
                                                                onClick={() => handleEdit(user)}
                                                            >
                                                                <FaEdit />
                                                            </IconButton>
                                                        </Tooltip.Trigger>
                                                        <Tooltip.Positioner>
                                                            <Tooltip.Content>
                                                                Edit User
                                                            </Tooltip.Content>
                                                        </Tooltip.Positioner>
                                                    </Tooltip.Root>
                                                    <Tooltip.Root>
                                                        <Tooltip.Trigger asChild>
                                                            <IconButton
                                                                aria-label="Reset Password"
                                                                size="sm"
                                                                colorPalette="yellow"
                                                                onClick={() => handleReset(user.id)}
                                                            >
                                                                <FaKey />
                                                            </IconButton>
                                                        </Tooltip.Trigger>
                                                        <Tooltip.Positioner>
                                                            <Tooltip.Content>
                                                                Reset Password
                                                            </Tooltip.Content>
                                                        </Tooltip.Positioner>
                                                    </Tooltip.Root>
                                                    <Tooltip.Root>
                                                        <Tooltip.Trigger asChild>
                                                            <IconButton
                                                                aria-label="Delete User"
                                                                size="sm"
                                                                colorPalette="red"
                                                                onClick={() => handleDelete(user.id)}
                                                            >
                                                                <FaTrash />
                                                            </IconButton>
                                                        </Tooltip.Trigger>
                                                        <Tooltip.Positioner>
                                                            <Tooltip.Content>
                                                                Delete User
                                                            </Tooltip.Content>
                                                        </Tooltip.Positioner>
                                                    </Tooltip.Root>
                                                </>
                                            )}
                                        </HStack>
                                    </Table.Cell>
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                </Table.Root>
            </Box>
        </Box>
    );
};

export default AdminUserManagement;
