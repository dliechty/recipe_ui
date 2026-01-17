import { renderWithProviders, screen, waitFor } from '../../../../test-utils';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AddTemplatePage from '../AddTemplatePage';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as useMealsHooks from '../../../../hooks/useMeals';

// Mock the hook
vi.mock('../../../../hooks/useMeals', async () => {
    const actual = await vi.importActual('../../../../hooks/useMeals');
    return {
        ...actual,
        useCreateMealTemplate: vi.fn(),
    };
});

describe('AddTemplatePage Breadcrumbs', () => {
    // Setup default mock return value
    const mockCreateTemplate = {
        mutate: vi.fn(),
        isPending: false,
    };

    beforeEach(() => {
        vi.mocked(useMealsHooks.useCreateMealTemplate).mockReturnValue(mockCreateTemplate as unknown as ReturnType<typeof useMealsHooks.useCreateMealTemplate>);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('shows "Add Template" breadcrumb when visiting directly', async () => {
        renderWithProviders(
            <MemoryRouter initialEntries={['/meals/templates/new']}>
                <Routes>
                    <Route path="/meals/templates/new" element={<AddTemplatePage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('link', { name: /Templates/i })).toBeInTheDocument();
        });

        // "Templates" is a link
        const templatesLink = screen.getByRole('link', { name: /Templates/i });
        expect(templatesLink).toHaveAttribute('href', '/meals/templates');

        // "Add Template" is current page (text, not link)
        expect(screen.getByText('Add Template')).toBeInTheDocument();
        expect(screen.queryByText('Duplicate Template')).not.toBeInTheDocument();
    });

    it('shows "Duplicate Template" breadcrumb and parent link when initialData and source info are present', async () => {
        const initialData = { 
            name: 'Copied Template',
            classification: 'Dinner' 
        };
        const sourceTemplateId = '123';
        const sourceTemplateName = 'Original Template';

        renderWithProviders(
            <MemoryRouter initialEntries={[{
                pathname: '/meals/templates/new',
                state: { initialData, sourceTemplateId, sourceTemplateName }
            }]}>
                <Routes>
                    <Route path="/meals/templates/new" element={<AddTemplatePage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('link', { name: /Templates/i })).toBeInTheDocument();
        });

        // "Templates" link
        expect(screen.getByRole('link', { name: /Templates/i })).toHaveAttribute('href', '/meals/templates');

        // Parent Template link
        const parentLink = screen.getByRole('link', { name: sourceTemplateName });
        expect(parentLink).toBeInTheDocument();
        expect(parentLink).toHaveAttribute('href', `/meals/templates/${sourceTemplateId}`);

        // "Duplicate Template" current text
        expect(screen.getByText('Duplicate Template')).toBeInTheDocument();
    });
});
