"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.Config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
class Config {
    port;
    twitchClientId;
    twitchClientSecret;
    databasePath;
    tokenExpirationDays;
    dbHost;
    dbPort;
    dbUser;
    dbPassword;
    dbName;
    constructor() {
        this.port = Number(process.env.PORT || 3000);
        this.twitchClientId = process.env.TWITCH_CLIENT_ID || '';
        this.twitchClientSecret = process.env.TWITCH_CLIENT_SECRET || '';
        this.databasePath = process.env.DATABASE_PATH || path_1.default.resolve(__dirname, '../../../../database.sqlite');
        this.tokenExpirationDays = Number(process.env.TOKEN_EXPIRATION_DAYS || 3);
        this.dbHost = process.env.DB_HOST;
        this.dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;
        this.dbUser = process.env.DB_USER;
        this.dbPassword = process.env.DB_PASSWORD;
        this.dbName = process.env.DB_NAME;
        if (!this.twitchClientId) {
            throw new Error('TWITCH_CLIENT_ID environment variable is missing');
        }
        if (!this.twitchClientSecret) {
            throw new Error('TWITCH_CLIENT_SECRET environment variable is missing');
        }
    }
}
exports.Config = Config;
exports.config = new Config();
