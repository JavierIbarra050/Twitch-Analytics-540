"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const analyticsRoutes_1 = __importDefault(require("./Streamer/Infrastructure/Routes/analyticsRoutes"));
const userRoutes_1 = __importDefault(require("./User/Infrastructure/Routes/userRoutes"));
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/analytics', analyticsRoutes_1.default);
app.use('/analytics', userRoutes_1.default);
