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
import { useAuth } from '../context/AuthContext';
import { DefaultService } from '../client';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await DefaultService.login({
                username: email,
                password: password
            });
            login(response.access_token);
            navigate('/recipes');
        } catch (err) {
            console.error("Login failed:", err);
            setError("Login failed. Please check your credentials and try again.");
        }
    };

    return (
        <Container maxW="container.sm" centerContent py={10}>
            <VStack spacing={8} w="full">
                <Heading as="h1" size="xl" textAlign="center" color="fg.default">
                    Recipes and Meal Planning
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
                    <VStack spacing={4} as="form" onSubmit={handleSubmit}>
                        <Heading as="h2" size="md" mb={4} color="fg.default">
                            Welcome Back
                        </Heading>
                        {error && (
                            <Box w="full" p={3} bg="red.900" color="white" borderRadius="md" borderColor="red.500" borderWidth={1}>
                                <Text fontSize="sm">{error}</Text>
                            </Box>
                        )}
                        <Box w="full">
                            <Text as="label" htmlFor="email" mb={2} display="block" color="fg.default">Email</Text>
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
                            <Text as="label" htmlFor="password" mb={2} display="block" color="fg.default">Password</Text>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
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
                        >
                            Login
                        </Button>
                    </VStack>
                </Box>
            </VStack>
        </Container>
    );
};

export default LoginPage;