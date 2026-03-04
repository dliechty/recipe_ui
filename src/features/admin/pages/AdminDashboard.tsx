import { Box, Container, Tabs } from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';
import AdminPendingRequests from '../components/AdminPendingRequests';
import AdminUserManagement from '../components/AdminUserManagement.tsx';
import AdminOperatingMode from '../components/AdminOperatingMode';
import AdminHouseholdManagement from '../components/AdminHouseholdManagement';

const VALID_TABS = ['users', 'pending', 'operating-mode', 'households'] as const;
type TabValue = typeof VALID_TABS[number];

const AdminDashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    const activeTab: TabValue = VALID_TABS.includes(tabParam as TabValue) ? (tabParam as TabValue) : 'users';

    const handleTabChange = ({ value }: { value: string }) => {
        setSearchParams(value === 'users' ? {} : { tab: value }, { replace: true });
    };

    return (
        <Container maxW="container.xl" py={8}>
            <Tabs.Root value={activeTab} onValueChange={handleTabChange}>
                <Tabs.List borderBottomWidth="1px" borderColor="border.default" mb={6}>
                    <Tabs.Trigger
                        value="users"
                        px={{ base: 2, md: 4 }}
                        py={2}
                        fontSize={{ base: "xs", md: "sm" }}
                        borderBottomWidth="2px"
                        borderBottomColor="transparent"
                        _selected={{ color: "fg.default", borderBottomColor: "vscode.accent" }}
                    >
                        <Box display={{ base: "none", sm: "inline" }}>User Management</Box>
                        <Box display={{ base: "inline", sm: "none" }}>Users</Box>
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="pending"
                        px={{ base: 2, md: 4 }}
                        py={2}
                        fontSize={{ base: "xs", md: "sm" }}
                        borderBottomWidth="2px"
                        borderBottomColor="transparent"
                        _selected={{ color: "fg.default", borderBottomColor: "vscode.accent" }}
                    >
                        <Box display={{ base: "none", sm: "inline" }}>Pending Requests</Box>
                        <Box display={{ base: "inline", sm: "none" }}>Pending</Box>
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="operating-mode"
                        px={{ base: 2, md: 4 }}
                        py={2}
                        fontSize={{ base: "xs", md: "sm" }}
                        borderBottomWidth="2px"
                        borderBottomColor="transparent"
                        _selected={{ color: "fg.default", borderBottomColor: "vscode.accent" }}
                    >
                        <Box display={{ base: "none", sm: "inline" }}>Operating Mode</Box>
                        <Box display={{ base: "inline", sm: "none" }}>Mode</Box>
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="households"
                        px={{ base: 2, md: 4 }}
                        py={2}
                        fontSize={{ base: "xs", md: "sm" }}
                        borderBottomWidth="2px"
                        borderBottomColor="transparent"
                        _selected={{ color: "fg.default", borderBottomColor: "vscode.accent" }}
                    >
                        Households
                    </Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="users">
                    <AdminUserManagement />
                </Tabs.Content>
                <Tabs.Content value="pending">
                    <AdminPendingRequests />
                </Tabs.Content>
                <Tabs.Content value="operating-mode">
                    <AdminOperatingMode />
                </Tabs.Content>
                <Tabs.Content value="households">
                    <AdminHouseholdManagement />
                </Tabs.Content>
            </Tabs.Root>
        </Container>
    );
};

export default AdminDashboard;
