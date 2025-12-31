import { describe, it, expect } from 'vitest';
import { formatQuantity } from '../formatters';

describe('formatQuantity', () => {
    it('returns empty string for undefined or null', () => {
        expect(formatQuantity(undefined)).toBe('');
        expect(formatQuantity(null)).toBe('');
    });

    it('returns string representation of integers', () => {
        expect(formatQuantity(1)).toBe('1');
        expect(formatQuantity(5)).toBe('5');
        expect(formatQuantity(100)).toBe('100');
    });

    it('formats common fractions correctly', () => {
        expect(formatQuantity(0.5)).toBe('1/2');
        expect(formatQuantity(0.25)).toBe('1/4');
        expect(formatQuantity(0.75)).toBe('3/4');
        expect(formatQuantity(0.2)).toBe('1/5');
        expect(formatQuantity(0.333)).toBe('1/3'); // Exact match from map
        expect(formatQuantity(1.0 / 3.0)).toBe('1/3'); // Calculated with tolerance
    });

    it('formats mixed numbers correctly', () => {
        expect(formatQuantity(1.5)).toBe('1 1/2');
        expect(formatQuantity(2.25)).toBe('2 1/4');
        expect(formatQuantity(3.75)).toBe('3 3/4');
    });

    it('formats eighths correctly', () => {
        expect(formatQuantity(0.125)).toBe('1/8');
        expect(formatQuantity(0.375)).toBe('3/8');
        expect(formatQuantity(0.625)).toBe('5/8');
        expect(formatQuantity(0.875)).toBe('7/8');
    });

    it('returns decimal for non-matching fractions', () => {
        expect(formatQuantity(0.1)).toBe('0.1');
        expect(formatQuantity(0.123)).toBe('0.123');
    });
});
