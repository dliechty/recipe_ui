
import React from 'react';
import { renderWithProviders, screen, waitFor, fireEvent } from '../../../../../test-utils';
import CommentList from '../CommentList';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { server } from '../../../../../mocks/server';
import { http, HttpResponse } from 'msw';

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock('../../../../../context/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
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
    });

    it('renders comments and allows adding a comment', async () => {
        server.use(
            http.get('*/recipes/:recipe_id/comments', () => {
                return HttpResponse.json([
                    {
                        id: 'c1',
                        recipe_id: 'r1',
                        user_id: 'user-2',
                        user_name: 'Other User',
                        text: 'Existing comment',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }
                ]);
            }),
            http.post('*/recipes/:recipe_id/comments', async ({ request }) => {
                const body = await request.json() as any;
                return HttpResponse.json({
                    id: 'c2',
                    recipe_id: 'r1',
                    user_id: 'user-1',
                    user_name: 'Test User',
                    text: body.text,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }, { status: 201 });
            })
        );

        renderWithProviders(<CommentList recipeId="r1" />);

        await waitFor(() => {
            expect(screen.getByText('Existing comment')).toBeInTheDocument();
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
                user_name: 'Test User',
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
                const body = await request.json() as any;
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

        // Find edit menu
        const menuButton = screen.getByLabelText('Comment options');
        fireEvent.click(menuButton);

        await waitFor(() => {
            expect(screen.getByText('Edit')).toBeInTheDocument();
        });
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        const textarea = screen.getByDisplayValue('My old comment');
        fireEvent.change(textarea, { target: { value: 'Updated comment' } });

        const saveButton = screen.getByText('Update Comment');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('Updated comment')).toBeInTheDocument();
        });
    });

    it('allows deleting a comment if admin', async () => {
        mockUseAuth.mockReturnValue({ user: { id: 'admin-user', is_admin: true } });

        let comments = [
            {
                id: 'c1',
                recipe_id: 'r1',
                user_id: 'user-2',
                user_name: 'Other User',
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

        const menuButton = screen.getByLabelText('Comment options');
        fireEvent.click(menuButton);

        await waitFor(() => {
            expect(screen.getByText('Delete')).toBeInTheDocument();
        });
        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.queryByText('Bad comment')).not.toBeInTheDocument();
        });
    });


});
