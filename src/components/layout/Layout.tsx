import React from 'react';
import { Box, Flex, HStack, Button, Menu, IconButton } from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';
import { Link as NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


interface NavItemProps {
    to: string;
    children: React.ReactNode;
}

const NavItem = ({ to, children }: NavItemProps) => {
    const location = useLocation();
    const isActive = location.pathname.startsWith(to);

    return (
        <Box
            as={NavLink}
            // @ts-expect-error - 'to' is passed to NavLink but Box types don't know it
            to={to}
            px={3}
            py={2}
            rounded={'md'}
            bg={isActive ? 'whiteAlpha.200' : undefined}
            _hover={{
                textDecoration: 'none',
                bg: 'whiteAlpha.200',
            }}
            _active={{
                bg: 'vscode.button',
                color: 'white',
            }}
            color={isActive ? 'white' : 'fg.default'}
            fontWeight={isActive ? 'bold' : 'medium'}
            display="block"
            borderBottomWidth={isActive ? '2px' : '0px'}
            borderColor="vscode.accent"
            borderBottomLeftRadius={isActive ? 0 : 'md'}
            borderBottomRightRadius={isActive ? 0 : 'md'}
        >
            {children}
        </Box>
    );
};

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
                                {/* Feature Flag: Check if meals feature is enabled */}
                                {import.meta.env.VITE_ENABLE_MEALS_FEATURE === 'true' && (
                                    <NavItem to="/meals">Meals</NavItem>
                                )}
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
                                            _expanded={{
                                                bg: 'vscode.button',
                                                color: 'white',
                                            }}
                                        >
                                            <FiMenu />
                                        </IconButton>
                                    </Menu.Trigger>
                                    <Menu.Positioner>
                                        <Menu.Content zIndex={10}>
                                            <Menu.Item value="recipes" asChild>
                                                <NavLink to="/recipes">Recipes</NavLink>
                                            </Menu.Item>
                                            {import.meta.env.VITE_ENABLE_MEALS_FEATURE === 'true' && (
                                                <Menu.Item value="meals" asChild>
                                                    <NavLink to="/meals">Meals</NavLink>
                                                </Menu.Item>
                                            )}
                                            {user?.is_admin && (
                                                <Menu.Item value="admin" asChild>
                                                    <NavLink to="/admin">Admin</NavLink>
                                                </Menu.Item>
                                            )}
                                            <Menu.Item value="recipe-box" asChild>
                                                <NavLink to="/recipe-box">Recipe Box</NavLink>
                                            </Menu.Item>
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
                                <NavItem to="/recipe-box">Recipe Box</NavItem>
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
