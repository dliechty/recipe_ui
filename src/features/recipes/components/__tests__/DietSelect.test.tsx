
import React from 'react';
import { renderWithProviders, screen } from '../../../../test-utils';
import DietSelect from '../DietSelect';
import { DietType } from '../../../../client';
import { describe, it, expect, vi } from 'vitest';

describe('DietSelect', () => {
    it('populates with existing values', async () => {
        const handleChange = vi.fn();
        const selectedDiets = [DietType.VEGAN, DietType.GLUTEN_FREE];

        renderWithProviders(
            <DietSelect
                selectedDiets={selectedDiets}
                onChange={handleChange}
            />
        );

        // Check if the values are displayed in the select box
        // react-select usually renders values as text
        expect(screen.getByText('Vegan')).toBeInTheDocument();
        expect(screen.getByText('Gluten Free')).toBeInTheDocument();
    });
});
