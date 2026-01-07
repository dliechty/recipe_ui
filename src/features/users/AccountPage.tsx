import React, { useState } from 'react';
import {
    Box,
    Button,
    Container,
    Heading,
    VStack,
    Text,
    HStack,
    Input,
    Icon
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthenticationService, UserUpdate } from '../../client';
import { toaster } from '../../toaster';
import { FaEdit } from 'react-icons/fa';

const AccountPage = () => {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState<UserUpdate>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleEdit = () => {
        if (user) {
            setEditFormData({
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name
            });
            setIsEditing(true);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditFormData({});
    };

    const handleSave = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            await AuthenticationService.updateUserAuthUsersUserIdPut(user.id, editFormData);
            await refreshUser();
            toaster.create({ title: "Profile updated successfully", type: "success" });
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
            toaster.create({ title: "Failed to update profile", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <Container maxW="container.md" py={10}>
            <Box
                p={8}
                borderWidth={1}
                borderColor="border.default"
                borderRadius="lg"
                boxShadow="lg"
                bg="bg.surface"
            >
                <VStack align="stretch" gap={6}>
                    <HStack justify="space-between" align="start">
                        <VStack align="stretch" gap={6} flex={1}>
                            <Box>
                                <Heading size="sm" mb={2} color="fg.muted">Email</Heading>
                                {isEditing ? (
                                    <Input
                                        name="email"
                                        value={editFormData.email || ''}
                                        onChange={handleInputChange}
                                        bg="vscode.inputBg"
                                        borderColor="border.default"
                                        color="fg.default"
                                        _hover={{ borderColor: 'vscode.accent' }}
                                        _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                                    />
                                ) : (
                                    <Text fontSize="lg" color="fg.default">{user?.email || 'N/A'}</Text>
                                )}
                            </Box>

                            <Box>
                                <Heading size="sm" mb={2} color="fg.muted">Name</Heading>
                                {isEditing ? (
                                    <HStack>
                                        <Box flex={1}>
                                            <Heading size="xs" mb={1} color="fg.subtle">First Name</Heading>
                                            <Input
                                                name="first_name"
                                                value={editFormData.first_name || ''}
                                                onChange={handleInputChange}
                                                bg="vscode.inputBg"
                                                borderColor="border.default"
                                                color="fg.default"
                                                _hover={{ borderColor: 'vscode.accent' }}
                                                _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                                            />
                                        </Box>
                                        <Box flex={1}>
                                            <Heading size="xs" mb={1} color="fg.subtle">Last Name</Heading>
                                            <Input
                                                name="last_name"
                                                value={editFormData.last_name || ''}
                                                onChange={handleInputChange}
                                                bg="vscode.inputBg"
                                                borderColor="border.default"
                                                color="fg.default"
                                                _hover={{ borderColor: 'vscode.accent' }}
                                                _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                                            />
                                        </Box>
                                    </HStack>
                                ) : (
                                    <Text fontSize="lg" color="fg.default">{user?.first_name} {user?.last_name}</Text>
                                )}
                            </Box>
                        </VStack>

                        {!isEditing && (
                            <Button
                                size="xs"
                                variant="ghost"
                                color="vscode.accent"
                                onClick={handleEdit}
                            >
                                <Icon as={FaEdit} mr={1} /> Edit
                            </Button>
                        )}
                    </HStack>

                    <Box>
                        <Heading size="sm" mb={2} color="fg.muted">Account ID</Heading>
                        <Text fontSize="sm" color="fg.subtle">{user?.id}</Text>
                    </Box>

                    <Box>
                        <Heading size="sm" mb={2} color="fg.muted">Account Type</Heading>
                        <Text fontSize="lg" color="fg.default">{user?.is_admin ? 'Administrator' : 'User'}</Text>
                    </Box>

                    <HStack pt={4}>
                        {isEditing ? (
                            <>
                                <Button
                                    onClick={handleSave}
                                    bg="vscode.button"
                                    color="white"
                                    _hover={{ bg: "vscode.buttonHover" }}
                                    loading={isLoading}
                                    size="xs"
                                >
                                    Save Changes
                                </Button>
                                <Button
                                    onClick={handleCancel}
                                    bg="vscode.button"
                                    color="white"
                                    _hover={{ bg: "vscode.buttonHover" }}
                                    size="xs"
                                >
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    onClick={() => navigate('/change-password')}
                                    bg="vscode.button"
                                    color="white"
                                    _hover={{ bg: "vscode.buttonHover" }}
                                    size="xs"
                                >
                                    Change Password
                                </Button>
                            </>
                        )}
                    </HStack>
                </VStack>
            </Box >
        </Container >
    );
};

export default AccountPage;
