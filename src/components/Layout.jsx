import React from 'react';
import { Box, Flex, HStack, Link, Button } from '@chakra-ui/react';
import { Link as NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const NavItem = ({ to, children }) => (
    <Link
        as={NavLink}
        to={to}
        px={3}
        py={2}
        rounded={'md'}
        _hover={{
            textDecoration: 'none',
            bg: 'whiteAlpha.200',
        }}
        _activeLink={{
            bg: 'vscode.button',
            color: 'white',
        }}
        color="fg.default"
        fontWeight="medium"
    >
        {children}
    </Link>
);

const Layout = ({ children }) => {
    const { isAuthenticated, logout } = useAuth();

    return (
        <Box minH="100vh" bg="bg.canvas" color="fg.default">
            {isAuthenticated && (
                <Box bg="bg.surface" px={4} py={3} borderBottomWidth={1} borderColor="border.default">
                    <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
                        <HStack spacing={8} alignItems={'center'}>
                            <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
                                <NavItem to="/recipes">Recipes</NavItem>
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
