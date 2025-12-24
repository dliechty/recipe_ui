import React from 'react';
import { Box, Flex, HStack, Link, Button } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
    const { isAuthenticated, logout } = useAuth();

    return (
        <Box minH="100vh" bg="bg.canvas" color="fg.default">
            {isAuthenticated && (
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
                                onClick={logout}
                            >
                                Logout
                            </Button>
                        </Flex>
                    </Flex>
                </Box>
            )}
            <Box p={4}>
                {children}
            </Box>
        </Box>
    );
};

export default Layout;
