"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const container_1 = require("../../../Shared/Infrastructure/container");
const router = (0, express_1.Router)();
router.post('/register', container_1.userController.register);
router.post('/token', container_1.userTokenController.generateToken);
exports.default = router;
