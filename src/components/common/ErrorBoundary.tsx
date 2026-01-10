import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Container, Heading, Text, VStack } from '@chakra-ui/react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log error to console in development
        console.error('ErrorBoundary caught an error:', error);
        console.error('Error info:', errorInfo.componentStack);

        // In production, you would send this to an error reporting service
        // Example: errorReportingService.log({ error, componentStack: errorInfo.componentStack });
    }

    handleReset = (): void => {
        this.setState({ hasError: false, error: null });
    };

    handleReload = (): void => {
        window.location.reload();
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Allow custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <Container maxW="container.md" py={20}>
                    <VStack gap={6} textAlign="center">
                        <Heading as="h1" size="xl" color="fg.default">
                            Something went wrong
                        </Heading>
                        <Text color="fg.muted" fontSize="lg">
                            We're sorry, but something unexpected happened. Please try refreshing the page.
                        </Text>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <Box
                                w="full"
                                p={4}
                                bg="red.900"
                                color="red.100"
                                borderRadius="md"
                                textAlign="left"
                                fontFamily="mono"
                                fontSize="sm"
                                overflow="auto"
                                maxH="200px"
                            >
                                <Text fontWeight="bold" mb={2}>
                                    {this.state.error.name}: {this.state.error.message}
                                </Text>
                                <Text whiteSpace="pre-wrap" opacity={0.8}>
                                    {this.state.error.stack}
                                </Text>
                            </Box>
                        )}
                        <Box>
                            <Button
                                onClick={this.handleReset}
                                bg="vscode.button"
                                color="white"
                                _hover={{ bg: 'vscode.buttonHover' }}
                                mr={3}
                            >
                                Try Again
                            </Button>
                            <Button
                                onClick={this.handleReload}
                                variant="outline"
                                borderColor="border.default"
                                color="fg.default"
                            >
                                Reload Page
                            </Button>
                        </Box>
                    </VStack>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
