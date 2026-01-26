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
import { AuthenticationService, ApiError } from '../../../client';
import { toaster } from '../../../toaster';

const RequestAccountPage = () => {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await AuthenticationService.requestAccountAuthRequestAccountPost({
                email: email,
                first_name: firstName,
                last_name: lastName
            });
            toaster.create({
                title: "Request Submitted",
                description: "Your account request has been submitted for approval.",
                type: "success",
                duration: 5000,
            });
            navigate('/');
        } catch (err: unknown) {
            console.error("Request failed:", err);
            // Extract error message if available from ApiError
            let errorMsg = "Request failed. Please try again.";
            const apiError = err as ApiError;
            if (apiError.body && apiError.body.detail) {
                errorMsg = typeof apiError.body.detail === 'string' ? apiError.body.detail : JSON.stringify(apiError.body.detail);
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
                    Request Account
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
                        <Text color="fg.muted" textAlign="center" mb={4}>
                            Enter your details below to request access. An administrator will review your request.
                        </Text>
                        {error && (
                            <Box w="full" p={3} bg="status.errorBg" color="status.error" borderRadius="md" borderColor="status.errorBorder" borderWidth={1}>
                                <Text fontSize="sm">{error}</Text>
                            </Box>
                        )}
                        <Box w="full">
                            {/* @ts-expect-error - htmlFor is valid for label but Box types don't infer it */}
                            <Box as="label" htmlFor="email" mb={2} display="block" color="fg.default">Email</Box>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                bg="vscode.inputBg"
                                borderColor="border.default"
                                color="fg.default"
                                _hover={{ borderColor: 'vscode.accent' }}
                                _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                            />
                        </Box>
                        <Box w="full">
                            {/* @ts-expect-error - htmlFor is valid for label but Box types don't infer it */}
                            <Box as="label" htmlFor="firstName" mb={2} display="block" color="fg.default">First Name</Box>
                            <Input
                                id="firstName"
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="First Name"
                                required
                                bg="vscode.inputBg"
                                borderColor="border.default"
                                color="fg.default"
                                _hover={{ borderColor: 'vscode.accent' }}
                                _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                            />
                        </Box>
                        <Box w="full">
                            {/* @ts-expect-error - htmlFor is valid for label but Box types don't infer it */}
                            <Box as="label" htmlFor="lastName" mb={2} display="block" color="fg.default">Last Name</Box>
                            <Input
                                id="lastName"
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Last Name"
                                required
                                bg="vscode.inputBg"
                                borderColor="border.default"
                                color="fg.default"
                                _hover={{ borderColor: 'vscode.accent' }}
                                _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
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
                            Submit Request
                        </Button>
                        <Button
                            variant="ghost"
                            width="full"
                            onClick={() => navigate('/')}
                            _hover={{ bg: 'vscode.listHover' }}
                            color="fg.default"
                        >
                            Back to Login
                        </Button>
                    </VStack>
                </Box>
            </VStack>
        </Container>
    );
};

export default RequestAccountPage;
