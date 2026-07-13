"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = void 0;
class Email {
    value;
    static REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    constructor(value) {
        if (value === undefined || value === null || value === '') {
            throw new Error('The email is mandatory');
        }
        if (typeof value !== 'string' || !Email.REGEX.test(value)) {
            throw new Error('The email must be a valid email address');
        }
        this.value = value;
    }
    toString() {
        return this.value;
    }
}
exports.Email = Email;
