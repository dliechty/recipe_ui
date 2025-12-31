
import React, { useState } from 'react';
import { Box, HStack, Text, Button, Icon, Menu } from '@chakra-ui/react';
import { FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../../../context/AuthContext';
import { useUpdateComment, useDeleteComment } from '../../../../hooks/useComments';
import CommentForm from './CommentForm';

// Define a local interface for the Comment object based on what we expect from API
interface Comment {
    id: string;
    text: string;
    user_id: string;
    user_name?: string;
    created_at: string;
    updated_at: string;
}

interface CommentItemProps {
    comment: Comment;
    recipeId: string;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, recipeId }) => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const updateComment = useUpdateComment(recipeId);
    const deleteComment = useDeleteComment(recipeId);

    const canEdit = user?.is_admin || (user?.id === comment.user_id);

    const handleUpdate = async (text: string) => {
        await updateComment.mutateAsync({ commentId: comment.id, data: { text } });
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this comment?')) {
            await deleteComment.mutateAsync(comment.id);
        }
    };

    if (isEditing) {
        return (
            <Box py={2} className="no-print">
                <CommentForm
                    recipeId={recipeId}
                    initialValue={comment.text}
                    onCancel={() => setIsEditing(false)}
                    onSubmit={handleUpdate}
                    isEditing
                />
            </Box>
        );
    }

    return (
        <Box
            p={3}
            borderWidth={1}
            borderColor="border.default"
            borderRadius="md"
            bg="bg.surface"
        >
            <HStack justify="space-between" mb={1} align="start">
                <HStack gap={2}>
                    <Text fontWeight="bold" fontSize="sm">{comment.user_name || 'Unknown User'}</Text>
                    <Text color="fg.muted" fontSize="xs">
                        {new Date(comment.created_at).toLocaleDateString()}
                    </Text>
                    {comment.updated_at !== comment.created_at && (
                        <Text color="fg.muted" fontSize="xs" fontStyle="italic">(edited)</Text>
                    )}
                </HStack>

                {canEdit && (
                    <Box className="no-print">
                        <Menu.Root>
                            <Menu.Trigger asChild>
                                <Button variant="ghost" size="xs" aria-label="Comment options">
                                    <Icon as={FaEllipsisV} />
                                </Button>
                            </Menu.Trigger>
                            <Menu.Content>
                                <Menu.Item value="edit" onClick={() => setIsEditing(true)}>
                                    <Icon as={FaEdit} mr={2} /> Edit
                                </Menu.Item>
                                <Menu.Item value="delete" color="red.500" onClick={handleDelete}>
                                    <Icon as={FaTrash} mr={2} /> Delete
                                </Menu.Item>
                            </Menu.Content>
                        </Menu.Root>
                    </Box>
                )}
            </HStack>
            <Text fontSize="md" whiteSpace="pre-wrap">{comment.text}</Text>
        </Box>
    );
};

export default CommentItem;
