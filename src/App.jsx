import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link as RouterLink, Navigate } from 'react-router-dom';
import { Box, Flex, Button, HStack, Link } from '@chakra-ui/react';
import RecipeList from './components/RecipeList';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    return (
        <Router>
            <Box minH="100vh" bg="bg.canvas" color="fg.default">
                {token && (
                    <Box bg="bg.surface" px={4} py={3} borderBottomWidth={1} borderColor="border.default">
                        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
                            <HStack spacing={8} alignItems={'center'}>
                                <Box color="fg.default" fontWeight="bold">Recipe App</Box>
                                <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
                                    <Link as={RouterLink} to="/recipes" color="fg.default" _hover={{ textDecoration: 'none', color: 'vscode.accent' }}>
                                        Recipes
                                    </Link>
                                </HStack>
                            </HStack>
                            <Flex alignItems={'center'}>
                                <Button
                                    variant={'solid'}
                                    bg="vscode.button"
                                    color="white"
                                    _hover={{ bg: 'vscode.buttonHover' }}
                                    size={'sm'}
                                    mr={4}
                                    onClick={handleLogout}
                                >
                                    Logout
                                </Button>
                            </Flex>
                        </Flex>
                    </Box>
                )}
                <Box p={4}>
                    <Routes>
                        <Route path="/" element={token ? <Navigate to="/recipes" /> : <LoginPage />} />
                        <Route
                            path="/recipes"
                            element={
                                <ProtectedRoute>
                                    <RecipeList />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </Box>
            </Box>
        </Router>
    );
}

export default App;
