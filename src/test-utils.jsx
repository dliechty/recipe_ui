import React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';

const system = createSystem(defaultConfig);

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

export function renderWithProviders(ui) {
    const testQueryClient = createTestQueryClient();
    return render(
        <QueryClientProvider client={testQueryClient}>
            <ChakraProvider value={system}>
                {ui}
            </ChakraProvider>
        </QueryClientProvider>
    );
}

// re-export everything
export * from '@testing-library/react';
