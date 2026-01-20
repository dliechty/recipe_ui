import React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider } from '@chakra-ui/react';

import { system } from './theme';

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

export function renderWithProviders(ui: React.ReactElement) {
    const testQueryClient = createTestQueryClient();
    return render(
        <QueryClientProvider client={testQueryClient}>
            <ChakraProvider value={system}>
                {ui}
            </ChakraProvider>
        </QueryClientProvider>
    );
}

export const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    const testQueryClient = createTestQueryClient();
    return (
        <QueryClientProvider client={testQueryClient}>
            <ChakraProvider value={system}>
                {children}
            </ChakraProvider>
        </QueryClientProvider>
    );
};

// re-export everything
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
