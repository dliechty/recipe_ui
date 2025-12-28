import React, { useState, useEffect } from 'react';
import {
    Button,
    VStack,
} from '@chakra-ui/react';
import { RecipeCreate, RecipeIngredientCreate, InstructionCreate, ComponentCreate } from '../../../client';
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
        core: {
            name: '',
            description: '',
            source: '',
            yield_amount: 1,
            yield_unit: 'servings',
            difficulty: null,
            cuisine: null,
            category: null,
            source_url: null,
            slug: null
        },
        times: {
            prep_time_minutes: 0,
            cook_time_minutes: 0,
            active_time_minutes: 0,
            total_time_minutes: 0
        },
        nutrition: {
            calories: null,
            serving_size: null
        },
        components: [
            {
                name: 'Main',
                ingredients: []
            }
        ],
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
                components: [{
                    name: 'Main',
                    ingredients: [{ ingredient_name: '', quantity: 0, unit: '', notes: '' } as RecipeIngredientCreate]
                }],
                instructions: [{ step_number: 1, text: '' } as InstructionCreate]
            }));
        }
    }, [initialData]);

    // Core Handlers
    const handleCoreChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            core: { ...prev.core, [name]: value }
        }));
    };

    const handleCoreNumberChange = (name: string, valueString: string) => {
        setFormData(prev => ({
            ...prev,
            core: { ...prev.core, [name]: parseFloat(valueString) || 0 }
        }));
    };

    // Times Handlers
    const handleTimesChange = (name: string, valueString: string) => {
        setFormData(prev => ({
            ...prev,
            times: { ...prev.times, [name]: parseInt(valueString) || 0 }
        }));
    };

    // Ingredient Handlers (Assumes single component 'Main' for now)
    const handleIngredientChange = (index: number, field: keyof RecipeIngredientCreate, value: string | number) => {
        const newComponents = [...formData.components];
        const newIngredients = [...newComponents[0].ingredients];

        // Handle number conversion for quantity
        let processedValue = value;
        if (field === 'quantity') {
            processedValue = parseFloat(value as string) || 0;
        }

        newIngredients[index] = { ...newIngredients[index], [field]: processedValue };
        newComponents[0].ingredients = newIngredients;
        setFormData(prev => ({ ...prev, components: newComponents }));
    };

    const addIngredient = () => {
        setFormData(prev => {
            const currentComponents = prev.components || [];
            if (currentComponents.length === 0) {
                return {
                    ...prev,
                    components: [{
                        name: 'Main',
                        ingredients: [{ ingredient_name: '', quantity: 0, unit: '', notes: '' } as RecipeIngredientCreate]
                    }]
                };
            }
            return {
                ...prev,
                components: prev.components.map((comp, i) => i === 0 ? {
                    ...comp,
                    ingredients: [...comp.ingredients, { ingredient_name: '', quantity: 0, unit: '', notes: '' } as RecipeIngredientCreate]
                } : comp)
            };
        });
    };

    const removeIngredient = (index: number) => {
        setFormData(prev => ({
            ...prev,
            components: prev.components.map((comp, i) => i === 0 ? {
                ...comp,
                ingredients: comp.ingredients.filter((_, idx) => idx !== index)
            } : comp)
        }));
    };

    // Instruction Handlers
    const handleInstructionChange = (index: number, value: string) => {
        const newInstructions = [...formData.instructions];
        newInstructions[index] = { ...newInstructions[index], text: value };
        setFormData(prev => ({ ...prev, instructions: newInstructions }));
    };

    const addInstruction = () => {
        setFormData(prev => ({
            ...prev,
            instructions: [...prev.instructions, { step_number: prev.instructions.length + 1, text: '' } as InstructionCreate]
        }));
    };

    const removeInstruction = (index: number) => {
        const newInstructions = formData.instructions.filter((_, i) => i !== index)
            .map((inst, i) => ({ ...inst, step_number: i + 1 })); // Re-index steps
        setFormData(prev => ({ ...prev, instructions: newInstructions }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.core.name) return;
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <VStack gap={6} align="stretch">
                <RecipeBasicsForm
                    core={formData.core}
                    times={formData.times}
                    handleCoreChange={handleCoreChange}
                    handleCoreNumberChange={handleCoreNumberChange}
                    handleTimesChange={handleTimesChange}
                />

                <RecipeIngredientsForm
                    ingredients={formData.components?.[0]?.ingredients || []}
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
