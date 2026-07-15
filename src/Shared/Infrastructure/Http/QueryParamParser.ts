export function parsePositiveIntQueryParam(value: unknown): number | null {
    if (typeof value !== 'string' || !/^\d+$/.test(value)) {
        return null;
    }

    return parseInt(value, 10);
}
