import React, { useState, useEffect } from 'react';
import {
    Button,
    VStack,
} from '@chakra-ui/react';
import { RecipeCreate, RecipeIngredientCreate, InstructionCreate } from '../client';
import RecipeBasicsForm from './RecipeBasicsForm';
import RecipeIngredientsForm from './RecipeIngredientsForm';
import RecipeInstructionsForm from './RecipeInstructionsForm';

interface RecipeFormProps {
    initialData?: RecipeCreate;
    onSubmit: (data: RecipeCreate) => void;
    isLoading: boolean;
}

const RecipeForm = ({ initialData, onSubmit, isLoading }: RecipeFormProps) => {
    const [formData, setFormData] = useState<RecipeCreate>({
        name: '',
        description: '',
        prep_time_minutes: 0,
        cook_time_minutes: 0,
        servings: 1,
        source: '',
        tags: [],
        ingredients: [],
        instructions: []
    });
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            // Initialize with one empty ingredient and instruction for better UX
            setFormData(prev => ({
                ...prev,
                ingredients: [{ ingredient_name: '', quantity: '', unit: '', notes: '' } as RecipeIngredientCreate],
                instructions: [{ step_number: 1, description: '' } as InstructionCreate]
            }));
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: keyof RecipeCreate, valueString: string) => {
        setFormData(prev => ({ ...prev, [name]: parseInt(valueString) || 0 }));
    };

    // Ingredient Handlers
    const handleIngredientChange = (index: number, field: keyof RecipeIngredientCreate, value: string | number) => {
        const newIngredients = [...formData.ingredients];
        newIngredients[index] = { ...newIngredients[index], [field]: value };
        setFormData(prev => ({ ...prev, ingredients: newIngredients }));
    };

    const addIngredient = () => {
        setFormData(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, { ingredient_name: '', quantity: '', unit: '', notes: '' } as RecipeIngredientCreate]
        }));
    };

    const removeIngredient = (index: number) => {
        const newIngredients = formData.ingredients.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, ingredients: newIngredients }));
    };

    // Instruction Handlers
    const handleInstructionChange = (index: number, value: string) => {
        const newInstructions = [...formData.instructions];
        newInstructions[index] = { ...newInstructions[index], description: value };
        setFormData(prev => ({ ...prev, instructions: newInstructions }));
    };

    const addInstruction = () => {
        setFormData(prev => ({
            ...prev,
            instructions: [...prev.instructions, { step_number: prev.instructions.length + 1, description: '' } as InstructionCreate]
        }));
    };

    const removeInstruction = (index: number) => {
        const newInstructions = formData.instructions.filter((_, i) => i !== index)
            .map((inst, i) => ({ ...inst, step_number: i + 1 })); // Re-index steps
        setFormData(prev => ({ ...prev, instructions: newInstructions }));
    };

    // Tag Handlers
    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            // tags is optional in RecipeCreate, ensure it exists
            const currentTags = formData.tags || [];
            if (!currentTags.includes(tagInput.trim())) {
                setFormData(prev => ({ ...prev, tags: [...currentTags, tagInput.trim()] }));
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        if (!formData.name) return;
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <VStack gap={6} align="stretch">
                <RecipeBasicsForm
                    formData={formData}
                    handleChange={handleChange}
                    handleNumberChange={handleNumberChange}
                    tagInput={tagInput}
                    setTagInput={setTagInput}
                    handleTagKeyDown={handleTagKeyDown}
                    removeTag={removeTag}
                />

                <RecipeIngredientsForm
                    ingredients={formData.ingredients}
                    handleIngredientChange={handleIngredientChange}
                    addIngredient={addIngredient}
                    removeIngredient={removeIngredient}
                />

                <RecipeInstructionsForm
                    instructions={formData.instructions}
                    handleInstructionChange={handleInstructionChange}
                    addInstruction={addInstruction}
                    removeInstruction={removeInstruction}
                />

                <Button
                    type="submit"
                    bg="vscode.button"
                    color="white"
                    _hover={{ bg: "vscode.buttonHover" }}
                    size="lg"
                    loading={isLoading}
                    loadingText="Saving..."
                >
                    Save Recipe
                </Button>
            </VStack>
        </form>
    );
};

export default RecipeForm;
