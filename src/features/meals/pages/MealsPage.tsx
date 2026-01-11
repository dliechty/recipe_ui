import { Container, Tabs, Box, Heading } from '@chakra-ui/react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const MealsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine current tab based on URL
    // /meals -> meals
    // /meals/templates -> templates
    const currentTab = location.pathname.includes('/templates') ? 'templates' : 'meals';

    const handleTabChange = (value: string) => {
        if (value === 'meals') {
            navigate('/meals');
        } else {
            navigate('/meals/templates');
        }
    };

    return (
        <Container maxW="container.xl" py={8}>
            <Heading mb={6}>Meals</Heading>
            <Tabs.Root value={currentTab} onValueChange={(e) => handleTabChange(e.value)}>
                <Tabs.List mb={6}>
                    <Tabs.Trigger value="meals">Meals</Tabs.Trigger>
                    <Tabs.Trigger value="templates">Templates</Tabs.Trigger>
                </Tabs.List>

                {/* 
                  We don't strictly need Tabs.Content if we are using routing for content.
                  But to keep the visual tab structure, we can just render Outlet here.
                  However, Tabs.Root expects Tabs.Content or similar. 
                  Let's just use the Tabs for navigation visuals and render Outlet below.
                  Or use Tabs.Content if we want to keep them mounted (but routing usually unmounts).
                  Actually, with routing, it's better to just have the Tabs act as links.
                */}
                <Box>
                    <Outlet />
                </Box>
            </Tabs.Root>
        </Container>
    );
};

export default MealsPage;
