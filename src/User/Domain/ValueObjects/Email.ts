export class Email {
    private readonly value: string;
    private static readonly REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    constructor(value: any) {
        if (value === undefined || value === null || value === '') {
            throw new Error('The email is mandatory');
        }
        if (typeof value !== 'string' || !Email.REGEX.test(value)) {
            throw new Error('The email must be a valid email address');
        }
        this.value = value;
    }

    toString(): string {
        return this.value;
    }
}
