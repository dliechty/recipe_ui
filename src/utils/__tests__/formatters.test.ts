import { formatDuration, formatDietName } from '../formatters';
import { describe, it, expect } from 'vitest';

describe('formatDuration', () => {
    it('returns empty string for undefined or null', () => {
        expect(formatDuration(undefined)).toBe('');
        expect(formatDuration(null)).toBe('');
    });

    it('returns 0m for 0', () => {
        expect(formatDuration(0)).toBe('0m');
    });

    it('returns minutes for less than 60', () => {
        expect(formatDuration(30)).toBe('30m');
        expect(formatDuration(59)).toBe('59m');
    });

    it('returns hours for exact hours', () => {
        expect(formatDuration(60)).toBe('1h');
        expect(formatDuration(120)).toBe('2h');
    });

    it('returns hours and minutes', () => {
        expect(formatDuration(61)).toBe('1h 1m');
        expect(formatDuration(90)).toBe('1h 30m');
        expect(formatDuration(150)).toBe('2h 30m');
    });
});

describe('formatDietName', () => {
    it('capitalizes single word', () => {
        expect(formatDietName('vegan')).toBe('Vegan');
    });

    it('replaces dashes with spaces and capitalizes each word', () => {
        expect(formatDietName('gluten-free')).toBe('Gluten Free');
        expect(formatDietName('low-carb')).toBe('Low Carb');
    });

    it('handles multiple dashes correctly', () => {
        expect(formatDietName('very-restricted-diet')).toBe('Very Restricted Diet');
    });
});
