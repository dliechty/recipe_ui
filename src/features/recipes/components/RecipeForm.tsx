import React, { useState, useEffect } from 'react';
import {
    Button,
    VStack,
} from '@chakra-ui/react';
import { RecipeCreate, RecipeIngredientCreate, InstructionCreate, DietType } from '../../../client';
import RecipeBasicsForm from './RecipeBasicsForm';
import RecipeIngredientsForm from './RecipeIngredientsForm';
import RecipeInstructionsForm from './RecipeInstructionsForm';

interface RecipeFormProps {
    initialData?: RecipeCreate;
    onSubmit: (data: RecipeCreate) => void;
    isLoading: boolean;
}

// Internal types with stable IDs for UI state
interface RecipeIngredientWithId extends RecipeIngredientCreate {
    id: string;
}

interface InstructionWithId extends InstructionCreate {
    id: string;
}

interface ComponentWithId {
    name: string;
    ingredients: RecipeIngredientWithId[];
}

// Extended RecipeCreate for form state
interface RecipeFormState extends Omit<RecipeCreate, 'components' | 'instructions'> {
    components: ComponentWithId[];
    instructions: InstructionWithId[];
    parent_recipe_id?: string | null;
}

// New Props for child components (updated interfaces)
export interface RecipeIngredientsFormProps {
    components: ComponentWithId[];
    handleIngredientChange: (componentIndex: number, ingredientIndex: number, field: keyof RecipeIngredientCreate, value: string | number) => void;
    addIngredient: (componentIndex: number) => void;
    removeIngredient: (componentIndex: number, ingredientIndex: number) => void;
    handleComponentNameChange: (index: number, name: string) => void;
    addComponent: () => void;
    removeComponent: (index: number) => void;
    reorderIngredients: (componentIndex: number, fromIndex: number, toIndex: number) => void;
}

export interface RecipeInstructionsFormProps {
    instructions: InstructionWithId[];
    handleInstructionChange: (index: number, value: string) => void;
    addInstruction: () => void;
    removeInstruction: (index: number) => void;
    reorderInstructions: (fromIndex: number, toIndex: number) => void;
}

const RecipeForm = ({ initialData, onSubmit, isLoading }: RecipeFormProps) => {
    const [formData, setFormData] = useState<RecipeFormState>({
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
            slug: null,
            protein: null
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
        instructions: [],
        suitable_for_diet: [],
        parent_recipe_id: null
    });

    useEffect(() => {
        if (initialData) {
            // Inject stable IDs
            // Inject stable IDs and map fields if necessary (handle API vs Form mismatch)
            setFormData({
                ...initialData,
                components: initialData.components.map(c => ({
                    ...c,
                    ingredients: c.ingredients
                        .slice()
                        .sort((a: RecipeIngredientCreate & { order?: number }, b: RecipeIngredientCreate & { order?: number }) => (a.order || 0) - (b.order || 0))
                        .map(i => ({
                            ...i,
                            // Map 'item' from API to 'ingredient_name' for Form if needed
                            ingredient_name: i.ingredient_name || (i as unknown as { item: string }).item || '',
                            id: crypto.randomUUID()
                        }))
                })),
                instructions: initialData.instructions.map(i => ({ ...i, id: crypto.randomUUID() }))
            });
        } else {
            // Initialize with one empty ingredient and instruction using stable IDs
            setFormData(prev => ({
                ...prev,
                components: [{
                    name: 'Main',
                    ingredients: [{ ingredient_name: '', quantity: 0, unit: '', notes: '', id: crypto.randomUUID() }]
                }],
                instructions: [{ step_number: 1, text: '', id: crypto.randomUUID() }]
            }));
        }
    }, [initialData]);

    // Core Handlers (unchanged logic, type compatible)
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

    const handleNutritionChange = (name: string, valueString: string) => {
        setFormData(prev => ({
            ...prev,
            nutrition: { ...prev.nutrition, [name]: name === 'calories' ? (parseInt(valueString) || 0) : valueString }
        }));
    };

    const handleDietChange = (selectedDiets: DietType[]) => {
        setFormData(prev => ({
            ...prev,
            suitable_for_diet: selectedDiets
        }));
    };

    const handleParentIdChange = (id: string | null) => {
        setFormData(prev => ({
            ...prev,
            parent_recipe_id: id
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
        newComponents[componentIndex] = { ...newComponents[componentIndex], ingredients: newIngredients };
        setFormData(prev => ({ ...prev, components: newComponents }));
    };

    const addIngredient = (componentIndex: number) => {
        setFormData(prev => {
            const newComponents = [...prev.components];
            newComponents[componentIndex] = {
                ...newComponents[componentIndex],
                ingredients: [...newComponents[componentIndex].ingredients, { ingredient_name: '', quantity: 0, unit: '', notes: '', id: crypto.randomUUID() }]
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
                    ingredients: [{ ingredient_name: '', quantity: 0, unit: '', notes: '', id: crypto.randomUUID() }]
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
            instructions: [...prev.instructions, { step_number: prev.instructions.length + 1, text: '', id: crypto.randomUUID() }]
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

        // Clean up internal IDs before submitting
        const cleanData: RecipeCreate = {
            ...formData,
            parent_recipe_id: formData.parent_recipe_id,
            components: formData.components.map(c => ({
                name: c.name,
                ingredients: c.ingredients.map((ingredient) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { id, ...rest } = ingredient;
                    return rest;
                })
            })),
            instructions: formData.instructions.map((instruction) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, ...rest } = instruction;
                return rest;
            })
        };

        onSubmit(cleanData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <VStack gap={6} align="stretch">
                <RecipeBasicsForm
                    core={formData.core}
                    times={formData.times}
                    nutrition={formData.nutrition}
                    diet={formData.suitable_for_diet || []}
                    handleCoreChange={handleCoreChange}
                    handleCoreNumberChange={handleCoreNumberChange}
                    handleTimesChange={handleTimesChange}
                    handleNutritionChange={handleNutritionChange}
                    handleDietChange={handleDietChange}
                    parentRecipeId={formData.parent_recipe_id}
                    handleParentIdChange={handleParentIdChange}
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
                    size="sm"
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
