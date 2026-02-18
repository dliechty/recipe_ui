import { Container, Tabs } from '@chakra-ui/react';
import AdminPendingRequests from '../components/AdminPendingRequests';
import AdminUserManagement from '../components/AdminUserManagement.tsx';
import AdminOperatingMode from '../components/AdminOperatingMode';

const AdminDashboard = () => {
    return (
        <Container maxW="container.xl" py={8}>
            <Tabs.Root defaultValue="users">
                <Tabs.List borderBottomWidth="1px" borderColor="border.default" mb={6}>
                    <Tabs.Trigger
                        value="users"
                        px={4}
                        py={2}
                        borderBottomWidth="2px"
                        borderBottomColor="transparent"
                        _selected={{ color: "fg.default", borderBottomColor: "vscode.accent" }}
                    >
                        User Management
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="pending"
                        px={4}
                        py={2}
                        borderBottomWidth="2px"
                        borderBottomColor="transparent"
                        _selected={{ color: "fg.default", borderBottomColor: "vscode.accent" }}
                    >
                        Pending Requests
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="operating-mode"
                        px={4}
                        py={2}
                        borderBottomWidth="2px"
                        borderBottomColor="transparent"
                        _selected={{ color: "fg.default", borderBottomColor: "vscode.accent" }}
                    >
                        Operating Mode
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
            </Tabs.Root>
        </Container>
    );
};

export default AdminDashboard;
