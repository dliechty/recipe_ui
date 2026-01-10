import { Container, Tabs } from '@chakra-ui/react'; // Adjust tabs import if needed for Chakra v3
import AdminPendingRequests from '../components/AdminPendingRequests';
import AdminUserManagement from '../components/AdminUserManagement.tsx';

// Ensure Chakra v3 Tabs usage is correct. 
// Assuming Tabs.Root, Tabs.List, Tabs.Trigger, Tabs.Content pattern effectively or Tabs, TabList, Tab, TabPanels, TabPanel
// Checking standard Chakra usage. Since I don't have docs, I will assume standard v2-like or check theme.
// Let's use standard v2 for now and fix if errors. 
// Wait, "recipe_ui" uses "@chakra-ui/react": "^3.30.0". 
// I'll check if I can find Tabs usage in other files.
// I'll search for Tabs.

const AdminDashboard = () => {
    return (
        <Container maxW="container.xl" py={8}>
            <Tabs.Root defaultValue="users">
                <Tabs.List borderWidth="1px" borderColor="border.default" borderRadius="md" p="1" bg="bg.surface">
                    <Tabs.Trigger value="users" _selected={{ color: "white", bg: "button" }} borderRadius="sm" px={4} py={2}>User Management</Tabs.Trigger>
                    <Tabs.Trigger value="pending" _selected={{ color: "white", bg: "button" }} borderRadius="sm" px={4} py={2}>Pending Requests</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="users">
                    <AdminUserManagement />
                </Tabs.Content>
                <Tabs.Content value="pending">
                    <AdminPendingRequests />
                </Tabs.Content>
            </Tabs.Root>
        </Container>
    );
};

export default AdminDashboard;
