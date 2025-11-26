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
import { login } from '../services/api';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await login(email, password);
            localStorage.setItem('token', response.data.access_token);
            window.location.href = '/recipes';
        } catch (err) {
            console.error("Login failed:", err);
            setError("Login failed. Please check your credentials and try again.");
        }
    };

    return (
        <Container maxW="container.sm" centerContent py={10}>
            <VStack spacing={8} w="full">
                <Heading as="h1" size="xl" textAlign="center">
                    Recipes and Meal Planning
                </Heading>
                <Box
                    w="full"
                    p={8}
                    borderWidth={1}
                    borderRadius="lg"
                    boxShadow="lg"
                    bg="gray.700"
                >
                    <VStack spacing={4} as="form" onSubmit={handleSubmit}>
                        <Heading as="h2" size="md" mb={4}>
                            Welcome Back
                        </Heading>
                        {error && (
                            <Box w="full" p={3} bg="red.500" color="white" borderRadius="md">
                                <Text fontSize="sm">{error}</Text>
                            </Box>
                        )}
                        <Box w="full">
                            <Text as="label" htmlFor="email" mb={2} display="block">Email</Text>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </Box>
                        <Box w="full">
                            <Text as="label" htmlFor="password" mb={2} display="block">Password</Text>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </Box>
                        <Button
                            type="submit"
                            colorScheme="teal"
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