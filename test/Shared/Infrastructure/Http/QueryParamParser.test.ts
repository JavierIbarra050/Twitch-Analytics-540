import { parsePositiveIntQueryParam } from '../../../../src/Shared/Infrastructure/Http/QueryParamParser';

describe('parsePositiveIntQueryParam', () => {
    it('should parse a valid digit string into a number', () => {
        expect(parsePositiveIntQueryParam('42')).toBe(42);
    });

    it('should parse zero', () => {
        expect(parsePositiveIntQueryParam('0')).toBe(0);
    });

    it('should return null for a string containing letters', () => {
        expect(parsePositiveIntQueryParam('12a')).toBeNull();
    });

    it('should return null for an empty string', () => {
        expect(parsePositiveIntQueryParam('')).toBeNull();
    });

    it('should return null when the value is undefined', () => {
        expect(parsePositiveIntQueryParam(undefined)).toBeNull();
    });

    it('should return null when the value is a number instead of a string', () => {
        expect(parsePositiveIntQueryParam(42)).toBeNull();
    });

    it('should return null for a decimal string', () => {
        expect(parsePositiveIntQueryParam('3.14')).toBeNull();
    });

    it('should return null for a negative string', () => {
        expect(parsePositiveIntQueryParam('-5')).toBeNull();
    });

    it('should return null for an array of strings', () => {
        expect(parsePositiveIntQueryParam(['1', '2'])).toBeNull();
    });
});
