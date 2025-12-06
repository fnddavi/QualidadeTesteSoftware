"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
// src/utils/jwt.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "1h");
if (!JWT_SECRET) {
    throw new Error("A variável de ambiente JWT_SECRET não está configurada.");
}
// Gera um JWT assinado
function generateToken(payload) {
    const options = { expiresIn: JWT_EXPIRES_IN };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, options);
}
// Verifica e retorna o payload do JWT
function verifyToken(token, ignoreExpiration = false) {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET, { ignoreExpiration });
}
