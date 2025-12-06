"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const validateBody_1 = require("../middlewares/validateBody");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Criar usuário
router.post("/", (0, validateBody_1.validateBody)([
    { name: "username", required: true, type: "string", minLength: 3 },
    { name: "password", required: true, type: "string", minLength: 6 },
]), user_controller_1.createUser);
// Login
router.post("/login", (0, validateBody_1.validateBody)([
    { name: "username", required: true, type: "string" },
    { name: "password", required: true, type: "string" },
]), user_controller_1.loginUser);
// Logout
router.post("/logout", authMiddleware_1.authMiddleware, user_controller_1.logoutUser);
exports.default = router;
