import React from 'react';
import { Container, Heading, VStack, Tabs, Box } from '@chakra-ui/react'; // Adjust tabs import if needed for Chakra v3
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
            <Heading mb={8} color="fg.default">Admin Dashboard</Heading>
            <Tabs.Root defaultValue="users">
                <Tabs.List>
                    <Tabs.Trigger value="users">User Management</Tabs.Trigger>
                    <Tabs.Trigger value="pending">Pending Requests</Tabs.Trigger>
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
