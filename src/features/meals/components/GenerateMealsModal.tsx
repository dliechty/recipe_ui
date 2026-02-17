import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Heading,
    HStack,
    Icon,
    Text,
    VStack,
    Input,
} from '@chakra-ui/react';
import { FaTimes } from 'react-icons/fa';
import { MealClassification, MealGenerateRequest } from '../../../client';

interface GenerateMealsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (request: MealGenerateRequest) => void;
    isGenerating: boolean;
}

const GenerateMealsModal = ({
    isOpen,
    onClose,
    onGenerate,
    isGenerating,
}: GenerateMealsModalProps) => {
    const [count, setCount] = useState(5);
    const [classification, setClassification] = useState(MealClassification.DINNER);

    useEffect(() => {
        if (isOpen) {
            setCount(5);
            setClassification(MealClassification.DINNER);
        }
    }, [isOpen]);

    const handleConfirm = () => {
        const finalCount = Math.max(1, count);
        onGenerate({
            count: finalCount,
            template_filter: [{ field: 'classification', operator: 'eq', value: classification }],
        });
    };

    if (!isOpen) return null;

    return (
        <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="overlay.backdrop"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={1000}
            backdropFilter="blur(4px)"
            onClick={(e) => {
                if (e.target === e.currentTarget && !isGenerating) {
                    onClose();
                }
            }}
        >
            <Box
                bg="bg.surface"
                borderRadius="xl"
                maxW="500px"
                w="90%"
                boxShadow="xl"
                borderWidth={1}
                borderColor="border.default"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <HStack
                    justify="space-between"
                    p={4}
                    borderBottomWidth={1}
                    borderColor="border.default"
                >
                    <Heading size="md" color="fg.default">Generate Meals</Heading>
                    <Button
                        size="xs"
                        variant="ghost"
                        onClick={onClose}
                        color="fg.muted"
                        _hover={{ color: "fg.default" }}
                        disabled={isGenerating}
                    >
                        <Icon as={FaTimes} />
                    </Button>
                </HStack>

                {/* Body */}
                <VStack p={6} align="stretch" gap={4}>
                    <Text color="fg.default">
                        Generate meals randomly from your templates. Each meal will be added to your queue.
                    </Text>

                    <Box>
                        {/* @ts-expect-error - htmlFor is valid for label but Box types don't infer it */}
                        <Box as="label" htmlFor="meal-classification" mb={2} fontSize="sm" fontWeight="medium" display="block" color="fg.default">
                            Classification
                        </Box>
                        <select
                            id="meal-classification"
                            value={classification}
                            onChange={(e) => setClassification(e.target.value as MealClassification)}
                            disabled={isGenerating}
                            style={{
                                backgroundColor: 'var(--chakra-colors-vscode-input-bg, #1e1e1e)',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                borderColor: 'var(--chakra-colors-border-default, #3e3e3e)',
                                color: 'var(--chakra-colors-fg-default, #cccccc)',
                                borderRadius: 'var(--chakra-radii-md, 6px)',
                                padding: '8px 12px',
                                fontSize: '14px',
                                width: '200px',
                            }}
                        >
                            {Object.values(MealClassification).map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </Box>

                    <Box>
                        {/* @ts-expect-error - htmlFor is valid for label but Box types don't infer it */}
                        <Box as="label" htmlFor="meal-count" mb={2} fontSize="sm" fontWeight="medium" display="block" color="fg.default">
                            Number of Meals
                        </Box>
                        <Input
                            id="meal-count"
                            type="number"
                            min={1}
                            max={20}
                            value={count}
                            onChange={(e) => setCount(parseInt(e.target.value) || 0)}
                            disabled={isGenerating}
                            bg="vscode.inputBg"
                            borderColor="border.default"
                            color="fg.default"
                            _hover={{ borderColor: 'vscode.accent' }}
                            _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                            w="120px"
                        />
                        <Text fontSize="xs" color="fg.muted" mt={1}>
                            Meals will be randomly generated from available templates.
                        </Text>
                    </Box>
                </VStack>

                {/* Footer */}
                <HStack
                    justify="flex-end"
                    p={4}
                    gap={3}
                    borderTopWidth={1}
                    borderColor="border.default"
                >
                    <Button
                        bg="button.success"
                        color="white"
                        _hover={{ bg: "button.successHover" }}
                        size="sm"
                        onClick={handleConfirm}
                        loading={isGenerating}
                    >
                        Generate
                    </Button>
                    <Button
                        variant="ghost"
                        bg="button.secondary"
                        color="white"
                        _hover={{ bg: "button.secondaryHover" }}
                        size="sm"
                        onClick={onClose}
                        disabled={isGenerating}
                    >
                        Cancel
                    </Button>
                </HStack>
            </Box>
        </Box>
    );
};

export default GenerateMealsModal;
