import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Heading,
    HStack,
    Icon,
    Text,
    VStack,
    Input
} from '@chakra-ui/react';
import { FaTimes } from 'react-icons/fa';

interface GenerateMealModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (date: string | null) => void;
    isGenerating: boolean;
    templateName: string;
}

const GenerateMealModal = ({
    isOpen,
    onClose,
    onGenerate,
    isGenerating,
    templateName
}: GenerateMealModalProps) => {
    const [selectedDate, setSelectedDate] = useState<string>('');

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedDate('');
        }
    }, [isOpen]);

    const handleConfirm = () => {
        onGenerate(selectedDate || null);
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
                    <Heading size="md" color="fg.default">Generate Meal</Heading>
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
                    <Text>
                        Generating meal from template: <strong>{templateName}</strong>
                    </Text>
                    
                    <Box>
                        {/* @ts-expect-error - htmlFor is valid for label but Box types don't infer it */}
                        <Box as="label" htmlFor="scheduled-date" mb={2} fontSize="sm" fontWeight="medium" display="block">Scheduled Date (Optional)</Box>
                        <Input 
                            id="scheduled-date"
                            type="date" 
                            value={selectedDate} 
                            onChange={(e) => setSelectedDate(e.target.value)}
                            disabled={isGenerating}
                            bg="vscode.inputBg"
                            borderColor="border.default"
                            color="fg.default"
                            css={{ colorScheme: 'dark' }}
                            _hover={{ borderColor: 'vscode.accent' }}
                            _focus={{ borderColor: 'vscode.accent', boxShadow: '0 0 0 1px var(--chakra-colors-vscode-accent)' }}
                        />
                        <Text fontSize="xs" color="fg.muted" mt={1}>
                            Leave blank to create without a scheduled date.
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
                        Generate Meal
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

export default GenerateMealModal;
