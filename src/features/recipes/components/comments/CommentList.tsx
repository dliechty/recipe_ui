import React, { useState } from 'react';
import { Box, Heading, VStack, Button, Collapsible, Text, HStack, Switch, Spinner } from '@chakra-ui/react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useComments } from '../../../../hooks/useComments';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

interface CommentListProps {
    recipeId: string;
}

const CommentList: React.FC<CommentListProps> = ({ recipeId }) => {
    const { data: comments, isLoading } = useComments(recipeId);
    const [isOpen, setIsOpen] = useState(true);
    const [printComments, setPrintComments] = useState(true);

    if (isLoading) {
        return <Spinner size="sm" />;
    }

    const commentCount = comments?.length || 0;

    return (
        <Box mt={8} className={!printComments ? 'no-print' : ''}>
            <Collapsible.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
                <HStack justify="space-between" mb={4}>
                    <Collapsible.Trigger asChild>
                        <Button
                            variant="ghost"
                            fontWeight="bold"
                            display="flex"
                            alignItems="center"
                            gap={2}
                            p={0}
                            _hover={{ bg: 'transparent' }}
                        >
                            <Heading size="md" color="fg.default">
                                COMMENTS ({commentCount})
                            </Heading>
                            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                        </Button>
                    </Collapsible.Trigger>

                    <HStack gap={2} className="no-print">
                        <Text fontSize="sm">Print Comments</Text>
                        <Switch.Root
                            checked={printComments}
                            onCheckedChange={(e) => setPrintComments(e.checked)}
                            size="sm"
                        >
                            <Switch.HiddenInput />
                            <Switch.Control>
                                <Switch.Thumb />
                            </Switch.Control>
                        </Switch.Root>
                    </HStack>
                </HStack>

                <Collapsible.Content>
                    <VStack align="stretch" gap={4}>
                        <Box className="no-print">
                            <CommentForm recipeId={recipeId} />
                        </Box>

                        {comments && comments.length > 0 ? (
                            comments.map((comment: any) => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    recipeId={recipeId}
                                />
                            ))
                        ) : (
                            <Text color="fg.muted" fontStyle="italic">No comments yet. Be the first to share your thoughts!</Text>
                        )}
                    </VStack>
                </Collapsible.Content>
            </Collapsible.Root>
        </Box>
    );
};

export default CommentList;
