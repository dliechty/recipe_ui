import { renderWithProviders, screen, waitFor, fireEvent } from '../../../../../test-utils';
import CommentList from '../CommentList';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { server } from '../../../../../mocks/server';
import { http, HttpResponse } from 'msw';
import { CommentCreate, CommentUpdate } from '../../../../../client';

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock('../../../../../context/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
}));

// Mock AdminModeContext - default mode
const mockUseAdminMode = vi.fn();
vi.mock('../../../../../context/AdminModeContext', () => ({
    useAdminMode: () => mockUseAdminMode(),
}));

// Mock Toaster
vi.mock('../../../../../toaster', () => ({
    toaster: {
        create: vi.fn(),
    },
}));

describe('CommentList', () => {
    beforeEach(() => {
        mockUseAuth.mockReturnValue({ user: { id: 'user-1', is_admin: false, first_name: 'Test', last_name: 'User' } });
        mockUseAdminMode.mockReturnValue({ adminModeActive: false, impersonatedUserId: null });
    });

    it('renders comments and allows adding a comment', async () => {
        server.use(
            http.get('*/recipes/:recipe_id/comments', () => {
                return HttpResponse.json([
                    {
                        id: 'c1',
                        recipe_id: 'r1',
                        user_id: 'user-2',
                        user: { first_name: 'Other', last_name: 'User' },
                        text: 'Existing comment',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }
                ]);
            }),
            http.post('*/recipes/:recipe_id/comments', async ({ request }) => {
                const body = await request.json() as CommentCreate;
                return HttpResponse.json({
                    id: 'c2',
                    recipe_id: 'r1',
                    user_id: 'user-1',
                    user: { first_name: 'Test', last_name: 'User' },
                    text: body.text,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }, { status: 201 });
            })
        );

        renderWithProviders(<CommentList recipeId="r1" />);

        await waitFor(() => {
            expect(screen.getByText('Existing comment')).toBeInTheDocument();
            expect(screen.getByText('Other User')).toBeInTheDocument();
        });


        // Check header count
        expect(screen.getByText(/COMMENTS \(1\)/)).toBeInTheDocument();

        // Add a comment
        const textarea = screen.getByPlaceholderText('Add a comment...');
        fireEvent.change(textarea, { target: { value: 'New awesome comment' } });

        const postButton = screen.getByText('Post Comment');
        fireEvent.click(postButton);

        await waitFor(() => {
            expect(screen.getByText('New awesome comment')).toBeInTheDocument();
        });
    });

    it('allows editing a comment if owner', async () => {
        let comments = [
            {
                id: 'c1',
                recipe_id: 'r1',
                user_id: 'user-1',
                user: { first_name: 'Test', last_name: 'User' },
                text: 'My old comment',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }
        ];

        server.use(
            http.get('*/recipes/:recipe_id/comments', () => {
                return HttpResponse.json(comments);
            }),
            http.put('*/recipes/:recipe_id/comments/:comment_id', async ({ request }) => {
                const body = await request.json() as CommentUpdate;
                const updated = {
                    ...comments[0],
                    text: body.text,
                    updated_at: new Date().toISOString()
                };
                comments = [updated];
                return HttpResponse.json(updated);
            })
        );


        renderWithProviders(<CommentList recipeId="r1" />);

        await waitFor(() => {
            expect(screen.getByText('My old comment')).toBeInTheDocument();
        });

        // Find edit button (no menu anymore)
        const editButton = screen.getByLabelText('Edit comment');
        fireEvent.click(editButton);

        const textarea = screen.getByDisplayValue('My old comment');
        fireEvent.change(textarea, { target: { value: 'Updated comment' } });

        const saveButton = screen.getByText('Update Comment');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('Updated comment')).toBeInTheDocument();
        });
    });

    it('allows deleting a comment if admin in admin mode', async () => {
        mockUseAuth.mockReturnValue({ user: { id: 'admin-user', is_admin: true } });
        mockUseAdminMode.mockReturnValue({ adminModeActive: true, impersonatedUserId: null });

        let comments = [
            {
                id: 'c1',
                recipe_id: 'r1',
                user_id: 'user-2',
                user: { first_name: 'Other', last_name: 'User' },
                text: 'Bad comment',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }
        ];


        server.use(
            http.get('*/recipes/:recipe_id/comments', () => {
                return HttpResponse.json(comments);
            }),
            http.delete('*/recipes/:recipe_id/comments/:comment_id', () => {
                comments = [];
                return new HttpResponse(null, { status: 204 });
            })
        );

        // Mock confirm
        global.confirm = vi.fn().mockReturnValue(true);

        renderWithProviders(<CommentList recipeId="r1" />);

        await waitFor(() => {
            expect(screen.getByText('Bad comment')).toBeInTheDocument();
        });

        const deleteButton = screen.getByLabelText('Delete comment');
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.queryByText('Bad comment')).not.toBeInTheDocument();
        });
    });

    it('hides edit/delete buttons for admin in default mode viewing another user comment', async () => {
        mockUseAuth.mockReturnValue({ user: { id: 'admin-user', is_admin: true } });
        mockUseAdminMode.mockReturnValue({ adminModeActive: false, impersonatedUserId: null });

        server.use(
            http.get('*/recipes/:recipe_id/comments', () => {
                return HttpResponse.json([
                    {
                        id: 'c1',
                        recipe_id: 'r1',
                        user_id: 'user-2',
                        user: { first_name: 'Other', last_name: 'User' },
                        text: 'Default mode comment',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }
                ]);
            })
        );

        renderWithProviders(<CommentList recipeId="r1" />);

        await waitFor(() => {
            expect(screen.getByText('Default mode comment')).toBeInTheDocument();
        });

        expect(screen.queryByLabelText('Edit comment')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Delete comment')).not.toBeInTheDocument();
    });

    it('shows edit/delete buttons when admin impersonates the comment owner', async () => {
        mockUseAuth.mockReturnValue({ user: { id: 'admin-user', is_admin: true } });
        mockUseAdminMode.mockReturnValue({ adminModeActive: false, impersonatedUserId: 'user-2' });

        server.use(
            http.get('*/recipes/:recipe_id/comments', () => {
                return HttpResponse.json([
                    {
                        id: 'c1',
                        recipe_id: 'r1',
                        user_id: 'user-2',
                        user: { first_name: 'Other', last_name: 'User' },
                        text: 'Impersonated comment',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }
                ]);
            })
        );

        renderWithProviders(<CommentList recipeId="r1" />);

        await waitFor(() => {
            expect(screen.getByText('Impersonated comment')).toBeInTheDocument();
        });

        expect(screen.getByLabelText('Edit comment')).toBeInTheDocument();
        expect(screen.getByLabelText('Delete comment')).toBeInTheDocument();
    });

    it('hides edit/delete buttons when admin impersonates a non-owner of the comment', async () => {
        mockUseAuth.mockReturnValue({ user: { id: 'admin-user', is_admin: true } });
        mockUseAdminMode.mockReturnValue({ adminModeActive: false, impersonatedUserId: 'user-different' });

        server.use(
            http.get('*/recipes/:recipe_id/comments', () => {
                return HttpResponse.json([
                    {
                        id: 'c1',
                        recipe_id: 'r1',
                        user_id: 'user-2',
                        user: { first_name: 'Other', last_name: 'User' },
                        text: 'Non-owner comment',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }
                ]);
            })
        );

        renderWithProviders(<CommentList recipeId="r1" />);

        await waitFor(() => {
            expect(screen.getByText('Non-owner comment')).toBeInTheDocument();
        });

        expect(screen.queryByLabelText('Edit comment')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Delete comment')).not.toBeInTheDocument();
    });
});
