import React from 'react';
import {
    Box,
    Button,
    Container,
    Heading,
    VStack,
    Text,
    HStack
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AccountPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // User profile update is not fully implemented in UI as per plan focus on Password/Admin, 
    // but we can add a simple "Edit Profile" (Name/Email) if needed.
    // Spec has `PUT /auth/users/{user_id}`.
    // For now, I'll display info and "Change Password" button.

    return (
        <Container maxW="container.md" py={10}>
            <Heading mb={8} color="fg.default">My Account</Heading>
            <Box
                p={8}
                borderWidth={1}
                borderColor="border.default"
                borderRadius="lg"
                boxShadow="lg"
                bg="bg.surface"
            >
                <VStack align="stretch" gap={6}>
                    <Box>
                        <Heading size="sm" mb={2} color="fg.muted">Email</Heading>
                        <Text fontSize="lg">{user?.email || 'N/A'}</Text>
                    </Box>
                    <Box>
                        <Heading size="sm" mb={2} color="fg.muted">Name</Heading>
                        <Text fontSize="lg">{user?.first_name} {user?.last_name}</Text>
                    </Box>
                    <Box>
                        <Heading size="sm" mb={2} color="fg.muted">Account ID</Heading>
                        <Text fontSize="sm" color="fg.subtle">{user?.id}</Text>
                    </Box>

                    <HStack pt={4}>
                        <Button
                            onClick={() => navigate('/change-password')}
                            bg="vscode.button"
                            color="white"
                            _hover={{ bg: "vscode.buttonHover" }}
                        >
                            Change Password
                        </Button>
                    </HStack>
                </VStack>
            </Box>
        </Container>
    );
};

export default AccountPage;
