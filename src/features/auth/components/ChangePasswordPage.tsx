import React, { useState } from 'react';
import {
    Box,
    Button,
    Container,
    Heading,
    Input,
    VStack,
    Text
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { AuthenticationService } from '../../../client';
import { toaster } from '../../../toaster';

const ChangePasswordPage = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            await AuthenticationService.changePasswordAuthChangePasswordPost({
                old_password: currentPassword,
                new_password: newPassword
            });
            toaster.create({
                title: "Password Changed",
                description: "Your password has been successfully updated.",
                type: "success",
            });
            navigate('/recipes');
        } catch (err: any) {
            console.error("Password change failed:", err);
            let errorMsg = "Failed to change password.";
            if (err.body && err.body.detail) {
                errorMsg = typeof err.body.detail === 'string' ? err.body.detail : JSON.stringify(err.body.detail);
            }
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxW="container.sm" centerContent py={10}>
            <VStack gap={8} w="full">
                <Heading as="h1" size="xl" textAlign="center" color="fg.default">
                    Change Password
                </Heading>
                <Box
                    w="full"
                    p={8}
                    borderWidth={1}
                    borderColor="border.default"
                    borderRadius="lg"
                    boxShadow="lg"
                    bg="bg.surface"
                >
                    <VStack gap={4} as="form" onSubmit={handleSubmit}>
                        {error && (
                            <Box w="full" p={3} bg="red.900" color="white" borderRadius="md" borderColor="red.500" borderWidth={1}>
                                <Text fontSize="sm">{error}</Text>
                            </Box>
                        )}
                        <Box w="full">
                            {/* @ts-expect-error - htmlFor is valid for label but Box types don't infer it */}
                            <Box as="label" htmlFor="currentPassword" mb={2} display="block" color="fg.default">Current Password</Box>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                required
                                bg="vscode.inputBg"
                                borderColor="border.default"
                                color="fg.default"
                            />
                        </Box>
                        <Box w="full">
                            {/* @ts-expect-error - htmlFor is valid for label but Box types don't infer it */}
                            <Box as="label" htmlFor="newPassword" mb={2} display="block" color="fg.default">New Password</Box>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                                bg="vscode.inputBg"
                                borderColor="border.default"
                                color="fg.default"
                            />
                        </Box>
                        <Box w="full">
                            {/* @ts-expect-error - htmlFor is valid for label but Box types don't infer it */}
                            <Box as="label" htmlFor="confirmPassword" mb={2} display="block" color="fg.default">Confirm New Password</Box>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                                bg="vscode.inputBg"
                                borderColor="border.default"
                                color="fg.default"
                            />
                        </Box>
                        <Button
                            type="submit"
                            bg="vscode.button"
                            color="white"
                            _hover={{ bg: 'vscode.buttonHover' }}
                            width="full"
                            mt={4}
                            loading={isLoading}
                        >
                            Change Password
                        </Button>
                    </VStack>
                </Box>
            </VStack>
        </Container>
    );
};

export default ChangePasswordPage;
