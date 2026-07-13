"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTokenService = void 0;
const crypto_1 = __importDefault(require("crypto"));
class UserTokenService {
    userRepository;
    tokenExpirationDays;
    constructor(userRepository, tokenExpirationDays) {
        this.userRepository = userRepository;
        this.tokenExpirationDays = tokenExpirationDays;
    }
    async generateToken(email, apiKey) {
        const user = await this.userRepository.findByEmail(email);
        if (!user || user.getUserApiKey() !== apiKey) {
            throw new Error('Unauthorized');
        }
        const token = this.generateRandomToken();
        const expiresAt = this.calculateExpirationDate();
        await this.userRepository.saveToken(email, token, expiresAt);
        return token;
    }
    generateRandomToken() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
    calculateExpirationDate() {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + this.tokenExpirationDays);
        return expiresAt;
    }
}
exports.UserTokenService = UserTokenService;
