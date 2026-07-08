"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const crypto_1 = __importDefault(require("crypto"));
class UserService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async registerNewUser(email) {
        const newApiKey = this.generateApiKey();
        if (await this.userRepository.doesUserAlreadyExists(email)) {
            return await this.userRepository.saveUser(email, newApiKey);
        }
        const newUser = await this.userRepository.saveUser(email, newApiKey);
        return newUser;
    }
    generateApiKey() {
        const newApiKey = crypto_1.default.randomBytes(16).toString('hex');
        return newApiKey;
    }
}
exports.UserService = UserService;
