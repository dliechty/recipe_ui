import React from 'react';
import { Box, Flex, HStack, Button } from '@chakra-ui/react';
import { Link as NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


interface NavItemProps {
    to: string;
    children: React.ReactNode;
}

const NavItem = ({ to, children }: NavItemProps) => (
    <Box
        as={NavLink}
        // @ts-expect-error - 'to' is passed to NavLink but Box types don't know it
        to={to}
        px={3}
        py={2}
        rounded={'md'}
        _hover={{
            textDecoration: 'none',
            bg: 'whiteAlpha.200',
        }}
        _active={{
            bg: 'vscode.button',
            color: 'white',
        }}
        color="fg.default"
        fontWeight="medium"
        display="block"
    >
        {children}
    </Box>
);

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <Box minH="100vh" bg="bg.canvas" color="fg.default">
            {isAuthenticated && (
                <Box bg="bg.surface" px={4} py={3} borderBottomWidth={1} borderColor="border.default" className="no-print">
                    <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
                        <HStack gap={8} alignItems={'center'}>
                            <HStack as={'nav'} gap={4} display={{ base: 'none', md: 'flex' }}>
                                <NavItem to="/recipes">Recipes</NavItem>
                            </HStack>
                        </HStack>
                        <Flex alignItems={'center'}>
                            <HStack gap={4} mr={4} display={{ base: 'none', md: 'flex' }}>
                                {user?.is_admin && <NavItem to="/admin">Admin</NavItem>}
                                <NavItem to="/account">Account</NavItem>
                                <Button
                                    variant={'solid'}
                                    bg="vscode.button"
                                    color="white"
                                    _hover={{ bg: 'vscode.buttonHover' }}
                                    size={'sm'}
                                    onClick={logout}
                                >
                                    Logout
                                </Button>
                            </HStack>
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
