
import React, { useState } from 'react';
import { Button, Textarea, VStack, Box } from '@chakra-ui/react';
import { useAddComment } from '../../../../hooks/useComments';

interface CommentFormProps {
    recipeId: string;
    onCancel?: () => void;
    initialValue?: string;
    onSubmit?: (text: string) => void;
    isEditing?: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({ recipeId, onCancel, initialValue = '', onSubmit, isEditing = false }) => {
    const [text, setText] = useState(initialValue);
    const addComment = useAddComment(recipeId);

    // If we have an external submit handler (for editing), use it. 
    // Otherwise use the add mutation.
    const handleSubmit = async () => {
        if (!text.trim()) return;

        if (onSubmit) {
            onSubmit(text);
        } else {
            await addComment.mutateAsync({ text });
            setText('');
        }

        if (onCancel) {
            onCancel(); // For edit mode, or if we want to close the form
        }
    };

    const isLoading = addComment.isPending;

    return (
        <VStack align="stretch" gap={2}>
            <Textarea
                placeholder="Add a comment..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                resize="vertical"
                minH="100px"
                bg="bg.surface"
                _focus={{ borderColor: "vscode.accent" }}
            />
            <Box display="flex" justifyContent="flex-end" gap={2}>
                {onCancel && (
                    <Button
                        onClick={onCancel}
                        size="sm"
                        bg="gray.600"
                        color="white"
                        _hover={{ bg: "gray.700" }}
                    >
                        Cancel
                    </Button>

                )}
                <Button
                    onClick={handleSubmit}
                    loading={isLoading}
                    disabled={!text.trim() || isLoading}
                    bg="vscode.button"
                    color="white"
                    _hover={{ bg: "vscode.buttonHover" }}
                    size="sm"
                >
                    {isEditing ? 'Update Comment' : 'Post Comment'}
                </Button>
            </Box>
        </VStack>
    );
};

export default CommentForm;
