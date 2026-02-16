import { Container, Tabs, Box } from '@chakra-ui/react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const MealsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine current tab based on URL
    // /meals -> upcoming
    // /meals/templates -> templates
    // /meals/history -> history
    const getCurrentTab = () => {
        if (location.pathname.includes('/templates')) return 'templates';
        if (location.pathname.includes('/history')) return 'history';
        return 'upcoming';
    };

    const currentTab = getCurrentTab();

    const handleTabChange = (value: string) => {
        if (value === 'upcoming') {
            navigate('/meals');
        } else if (value === 'templates') {
            navigate('/meals/templates');
        } else if (value === 'history') {
            navigate('/meals/history');
        }
    };

    return (
        <Container maxW="container.xl" py={8}>

            <Tabs.Root value={currentTab} onValueChange={(e) => handleTabChange(e.value)}>
                <Tabs.List borderBottomWidth="1px" borderColor="border.default" mb={6}>
                    <Tabs.Trigger
                        value="upcoming"
                        px={4}
                        py={2}
                        borderBottomWidth="2px"
                        borderBottomColor="transparent"
                        _selected={{ color: "fg.default", borderBottomColor: "vscode.accent" }}
                    >
                        Upcoming
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="templates"
                        px={4}
                        py={2}
                        borderBottomWidth="2px"
                        borderBottomColor="transparent"
                        _selected={{ color: "fg.default", borderBottomColor: "vscode.accent" }}
                    >
                        Templates
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="history"
                        px={4}
                        py={2}
                        borderBottomWidth="2px"
                        borderBottomColor="transparent"
                        _selected={{ color: "fg.default", borderBottomColor: "vscode.accent" }}
                    >
                        History
                    </Tabs.Trigger>
                </Tabs.List>

                <Box>
                    <Outlet />
                </Box>
            </Tabs.Root>
        </Container>
    );
};

export default MealsPage;
