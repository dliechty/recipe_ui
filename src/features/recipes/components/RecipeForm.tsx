import React, { useState, useEffect } from 'react';
import {
    Button,
    VStack,
} from '@chakra-ui/react';
import { RecipeCreate, RecipeIngredientCreate, InstructionCreate } from '../../../client';
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

    // Ingredient Handlers
    const handleIngredientChange = (componentIndex: number, ingredientIndex: number, field: keyof RecipeIngredientCreate, value: string | number) => {
        const newComponents = [...formData.components];
        const newIngredients = [...newComponents[componentIndex].ingredients];

        // Handle number conversion for quantity
        let processedValue = value;
        if (field === 'quantity') {
            processedValue = parseFloat(value as string) || 0;
        }

        newIngredients[ingredientIndex] = { ...newIngredients[ingredientIndex], [field]: processedValue };
        newComponents[componentIndex].ingredients = newIngredients;
        setFormData(prev => ({ ...prev, components: newComponents }));
    };

    const addIngredient = (componentIndex: number) => {
        setFormData(prev => {
            const newComponents = [...prev.components];
            newComponents[componentIndex] = {
                ...newComponents[componentIndex],
                ingredients: [...newComponents[componentIndex].ingredients, { ingredient_name: '', quantity: 0, unit: '', notes: '' } as RecipeIngredientCreate]
            };
            return {
                ...prev,
                components: newComponents
            };
        });
    };

    const removeIngredient = (componentIndex: number, ingredientIndex: number) => {
        setFormData(prev => {
            const newComponents = [...prev.components];
            newComponents[componentIndex] = {
                ...newComponents[componentIndex],
                ingredients: newComponents[componentIndex].ingredients.filter((_, idx) => idx !== ingredientIndex)
            };
            return {
                ...prev,
                components: newComponents
            };
        });
    };

    const reorderIngredients = (componentIndex: number, fromIndex: number, toIndex: number) => {
        setFormData(prev => {
            const newComponents = [...prev.components];
            const newIngredients = [...newComponents[componentIndex].ingredients];
            const [movedIngredient] = newIngredients.splice(fromIndex, 1);
            newIngredients.splice(toIndex, 0, movedIngredient);

            newComponents[componentIndex] = {
                ...newComponents[componentIndex],
                ingredients: newIngredients
            };
            return { ...prev, components: newComponents };
        });
    };

    // Component Handlers
    const addComponent = () => {
        setFormData(prev => ({
            ...prev,
            components: [
                ...prev.components,
                {
                    name: 'New Component',
                    ingredients: [{ ingredient_name: '', quantity: 0, unit: '', notes: '' } as RecipeIngredientCreate]
                }
            ]
        }));
    };

    const removeComponent = (index: number) => {
        if (formData.components.length <= 1) return; // Prevent removing the last component
        setFormData(prev => ({
            ...prev,
            components: prev.components.filter((_, i) => i !== index)
        }));
    };

    const handleComponentNameChange = (index: number, name: string) => {
        const newComponents = [...formData.components];
        newComponents[index] = { ...newComponents[index], name };
        setFormData(prev => ({ ...prev, components: newComponents }));
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

    const reorderInstructions = (fromIndex: number, toIndex: number) => {
        setFormData(prev => {
            const newInstructions = [...prev.instructions];
            const [movedInstruction] = newInstructions.splice(fromIndex, 1);
            newInstructions.splice(toIndex, 0, movedInstruction);

            // Re-index steps
            const reindexedInstructions = newInstructions.map((inst, i) => ({
                ...inst,
                step_number: i + 1
            }));

            return { ...prev, instructions: reindexedInstructions };
        });
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
                    components={formData.components || []}
                    handleIngredientChange={handleIngredientChange}
                    addIngredient={addIngredient}
                    removeIngredient={removeIngredient}
                    reorderIngredients={reorderIngredients}
                    handleComponentNameChange={handleComponentNameChange}
                    addComponent={addComponent}
                    removeComponent={removeComponent}
                />

                <RecipeInstructionsForm
                    instructions={formData.instructions}
                    handleInstructionChange={handleInstructionChange}
                    addInstruction={addInstruction}
                    removeInstruction={removeInstruction}
                    reorderInstructions={reorderInstructions}
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
