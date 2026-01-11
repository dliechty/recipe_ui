
import React, { useState } from 'react';
import { Box, HStack, Text, Button, Icon } from '@chakra-ui/react';

import { FaEdit, FaTrash } from 'react-icons/fa';

import { useAuth } from '../../../../context/AuthContext';
import { useUpdateComment, useDeleteComment } from '../../../../hooks/useComments';
import CommentForm from './CommentForm';

import { Comment } from '../../../../client';


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

    const getUserName = () => {
        if (!comment.user) return 'Unknown User';
        if (comment.user.first_name && comment.user.last_name) {
            return `${comment.user.first_name} ${comment.user.last_name}`;
        }
        if (comment.user.first_name) return comment.user.first_name;
        return comment.user.email || 'Unknown User';
    };

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
                    <Text fontWeight="bold" fontSize="sm">{getUserName()}</Text>
                    <Text color="fg.muted" fontSize="xs">
                        {new Date(comment.created_at).toLocaleDateString()}
                    </Text>
                    {comment.updated_at !== comment.created_at && (
                        <Text color="fg.muted" fontSize="xs" fontStyle="italic">(edited)</Text>
                    )}
                </HStack>

                {canEdit && (
                    <Box className="no-print">
                        <HStack gap={1}>
                            <Button
                                size="xs"
                                aria-label="Edit comment"
                                onClick={() => setIsEditing(true)}
                                title="Edit"
                                bg="vscode.button"
                                color="white"
                                _hover={{ bg: "vscode.buttonHover" }}
                            >
                                <Icon as={FaEdit} />
                            </Button>
                            <Button
                                size="xs"
                                aria-label="Delete comment"
                                bg="red.600"
                                color="white"
                                _hover={{ bg: "red.700" }}
                                onClick={handleDelete}
                                title="Delete"
                            >
                                <Icon as={FaTrash} />
                            </Button>

                        </HStack>
                    </Box>

                )}
            </HStack>
            <Text fontSize="md" whiteSpace="pre-wrap">{comment.text}</Text>
        </Box>
    );
};

export default CommentItem;
