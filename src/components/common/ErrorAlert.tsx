import { Box, Text } from '@chakra-ui/react';

interface ErrorAlertProps {
    title?: string;
    description: string;
}

const ErrorAlert = ({ title = "Error", description }: ErrorAlertProps) => {
    return (
        <Box my={4} p={4} bg="status.errorBg" color="status.error" borderRadius="md" borderWidth={1} borderColor="status.errorBorder">
            <Text fontWeight="bold" fontSize="lg" mb={1}>
                {title}
            </Text>
            <Text>
                {description}
            </Text>
        </Box>
    );
};

export default ErrorAlert;
