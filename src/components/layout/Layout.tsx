import React from 'react';
import { Box, Flex, HStack, Button, Menu, IconButton } from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';
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
                            {/* Mobile Menu */}
                            <Box display={{ base: 'flex', md: 'none' }}>
                                <Menu.Root>
                                    <Menu.Trigger asChild>
                                        <IconButton
                                            aria-label='Options'
                                            variant='outline'
                                            color="fg.default"
                                            _hover={{ bg: 'whiteAlpha.200' }}
                                            _active={{ bg: 'whiteAlpha.300' }}
                                        >
                                            <FiMenu />
                                        </IconButton>
                                    </Menu.Trigger>
                                    <Menu.Positioner>
                                        <Menu.Content zIndex={10}>
                                            <Menu.Item value="recipes" asChild>
                                                <NavLink to="/recipes">Recipes</NavLink>
                                            </Menu.Item>
                                            {user?.is_admin && (
                                                <Menu.Item value="admin" asChild>
                                                    <NavLink to="/admin">Admin</NavLink>
                                                </Menu.Item>
                                            )}
                                            <Menu.Item value="account" asChild>
                                                <NavLink to="/account">Account</NavLink>
                                            </Menu.Item>
                                            <Menu.Item value="logout" onClick={logout}>
                                                Logout
                                            </Menu.Item>
                                        </Menu.Content>
                                    </Menu.Positioner>
                                </Menu.Root>
                            </Box>
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
