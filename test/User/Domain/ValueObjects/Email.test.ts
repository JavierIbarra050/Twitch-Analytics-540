import { Email } from '../../../../src/User/Domain/ValueObjects/Email';

describe('Email Value Object', () => {
    it('should create an Email instance for valid emails', () => {
        const validEmails = [
            'user@example.com',
            'john.doe@company.es',
            'admin@server.net',
            'a@b.co'
        ];

        for (const emailStr of validEmails) {
            const email = new Email(emailStr);
            expect(email.toString()).toBe(emailStr);
        }
    });

    it('should throw an error if email is missing', () => {
        const missingValues = [undefined, null, ''];

        for (const val of missingValues) {
            expect(() => new Email(val)).toThrow('The email is mandatory');
        }
    });

    it('should throw an error for invalid email formats', () => {
        const invalidEmails = [
            'plainaddress',
            '#@%^%#$@#$@#.com',
            '@example.com',
            'Joe Smith <email@example.com>',
            'email.example.com',
            'email@example@example.com',
            12345
        ];

        for (const val of invalidEmails) {
            expect(() => new Email(val)).toThrow('The email must be a valid email address');
        }
    });
});
