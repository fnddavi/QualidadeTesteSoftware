"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const redis_1 = require("../configs/redis");
async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, error: "Token não fornecido" });
        }
        const token = authHeader.slice(7);
        // tenta blacklist só se Redis responder
        const tokenHash = crypto_1.default.createHash("sha256").update(token).digest("hex");
        const blacklisted = await (0, redis_1.redisSafeGet)(`blacklist:jwt:${tokenHash}`);
        if (blacklisted) {
            return res.status(401).json({ success: false, error: "Token expirado ou inválido" });
        }
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        return next();
    }
    catch (err) {
        return res.status(401).json({ success: false, error: "Token inválido ou expirado" });
    }
}
