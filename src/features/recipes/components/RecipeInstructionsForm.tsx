import React from 'react';
import {
    Box,
    Button,
    Textarea,
    VStack,
    HStack,
    IconButton,
    Heading,
    Text
} from '@chakra-ui/react';
import { FaTrash, FaPlus } from 'react-icons/fa';
import { InstructionCreate } from '../../../client';

interface RecipeInstructionsFormProps {
    instructions: InstructionCreate[];
    handleInstructionChange: (index: number, value: string) => void;
    addInstruction: () => void;
    removeInstruction: (index: number) => void;
}

const RecipeInstructionsForm = ({
    instructions,
    handleInstructionChange,
    addInstruction,
    removeInstruction
}: RecipeInstructionsFormProps) => {
    return (
        <Box bg="bg.surface" p={6} borderRadius="lg" borderWidth={1} borderColor="border.default" boxShadow="sm">
            <Heading size="md" mb={6}>Instructions</Heading>
            <VStack gap={4} align="stretch">
                {instructions.map((instruction, index) => (
                    <HStack key={index} align="flex-start">
                        <Box pt={2} minW="24px" fontWeight="bold" color="fg.muted">
                            {index + 1}.
                        </Box>
                        <Box flex={1}>
                            <Textarea
                                placeholder={`Step ${index + 1} description`}
                                value={instruction.text}
                                onChange={(e) => handleInstructionChange(index, e.target.value)}
                                rows={2}
                            />
                        </Box>
                        <Box pt={1}>
                            <IconButton
                                colorPalette="red"
                                variant="ghost"
                                onClick={() => removeInstruction(index)}
                                aria-label="Remove instruction"
                            >
                                <FaTrash />
                            </IconButton>
                        </Box>
                    </HStack>
                ))}
                <Button
                    onClick={addInstruction}
                    bg="vscode.button"
                    color="white"
                    _hover={{ bg: "vscode.buttonHover" }}
                    alignSelf="start"
                >
                    <FaPlus /> Add Step
                </Button>
            </VStack>
        </Box>
    );
};

export default RecipeInstructionsForm;
