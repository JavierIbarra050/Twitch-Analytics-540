"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    email;
    apiKey;
    constructor(email, apiKey) {
        this.email = email;
        this.apiKey = apiKey;
    }
    getUserEmail() {
        return this.email;
    }
    getUserApiKey() {
        return this.apiKey;
    }
}
exports.User = User;
