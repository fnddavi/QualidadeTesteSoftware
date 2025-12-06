"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.loginUser = exports.createUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("../configs/db"));
const jwt_1 = require("../utils/jwt");
const crypto_1 = __importDefault(require("crypto"));
const redis_1 = require("../configs/redis"); // <- usa helper seguro (opcional)
//
// Criar usuário
//
const createUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        await db_1.default.query("INSERT INTO users (username, password) VALUES ($1, $2)", [username, hashedPassword]);
        res.status(201).json({
            success: true,
            data: { message: "Usuário criado com sucesso." },
        });
    }
    catch (error) {
        if (error.code === "23505") {
            res.status(400).json({
                success: false,
                error: error.message || "Nome de usuário já cadastrado. Escolha outro.",
            });
            return;
        }
        res.status(500).json({ success: false, error: "Erro ao criar usuário." });
    }
};
exports.createUser = createUser;
//
// Login de usuário
//
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await db_1.default.query("SELECT * FROM users WHERE username = $1", [username]);
        if (result.rows.length === 0) {
            res.status(401).json({ success: false, error: "Credenciais inválidas." });
            return;
        }
        const user = result.rows[0];
        const validPassword = await bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            res.status(401).json({ success: false, error: "Credenciais inválidas." });
            return;
        }
        const payload = { id: user.id, username: user.username };
        const token = (0, jwt_1.generateToken)(payload);
        res.status(200).json({
            success: true,
            data: {
                message: "Login realizado com sucesso.",
                token,
                user: { id: user.id, username: user.username },
            },
        });
    }
    catch (_error) {
        res.status(500).json({ success: false, error: "Erro ao realizar login." });
    }
};
exports.loginUser = loginUser;
//
// Logout de usuário
// - Adiciona o token à blacklist no Redis ATÉ expirar, se o Redis estiver disponível.
// - Se o Redis estiver offline/indisponível, responde sucesso do mesmo jeito (não quebra o fluxo).
//
const logoutUser = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                error: "Token não fornecido",
            });
            return;
        }
        const token = authHeader.split(" ")[1];
        // Decodifica o token mesmo que expirado (ignoreExpiration = true)
        const decoded = (0, jwt_1.verifyToken)(token, true);
        const exp = decoded?.exp;
        if (!exp) {
            res.status(400).json({
                success: false,
                error: "Token inválido",
            });
            return;
        }
        // TTL em segundos (quanto falta para o token expirar)
        const ttl = exp - Math.floor(Date.now() / 1000);
        // Usa hash do token para não guardar o JWT inteiro no Redis
        const tokenHash = crypto_1.default.createHash("sha256").update(token).digest("hex");
        // Tenta gravar na blacklist; se Redis estiver offline, segue mesmo assim
        const ok = await (0, redis_1.redisSafeSetex)(`blacklist:jwt:${tokenHash}`, ttl > 0 ? ttl : 60, // se já expirou, põe 60s pra evitar race condition
        "true");
        res.status(200).json({
            success: true,
            data: {
                message: ok
                    ? "Logout realizado com sucesso. Token invalidado."
                    : "Logout realizado (Redis indisponível, token não foi registrado na blacklist).",
            },
        });
    }
    catch (_error) {
        res.status(500).json({ success: false, error: "Erro ao realizar logout." });
    }
};
exports.logoutUser = logoutUser;
