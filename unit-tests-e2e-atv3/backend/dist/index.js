"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middlewares/errorHandler");
// =========================
// CONFIGURAÇÃO DO AMBIENTE
// =========================
dotenv_1.default.config({
    path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
    quiet: true,
});
// =========================
// CONFIGURAÇÕES GERAIS
// =========================
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3001;
// FRONT permitido (pode vir do .env)
const FRONT_ORIGIN = process.env.FRONT_ORIGIN || "http://localhost:5173";
// =========================
// MIDDLEWARES
// =========================
// Libera o front-end para consumir a API
app.use((0, cors_1.default)({
    origin: FRONT_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
// Permite JSON no corpo das requisições
app.use(express_1.default.json());
// Permite form-data (x-www-form-urlencoded)
app.use(express_1.default.urlencoded({ extended: true }));
// Suporte a cookies
app.use((0, cookie_parser_1.default)());
// =========================
// ROTAS PRINCIPAIS
// =========================
app.use("/", routes_1.default);
// =========================
// ROTA 404
// =========================
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: "Rota não encontrada",
    });
});
// =========================
// MIDDLEWARE GLOBAL DE ERRO
// =========================
app.use(errorHandler_1.errorHandler);
// =========================
// INICIALIZAÇÃO DO SERVIDOR
// =========================
app
    .listen(PORT, () => {
    console.log("========================================");
    console.log(`✅ Servidor rodando em: http://localhost:${PORT}`);
    console.log(`🌐 CORS liberado para: ${FRONT_ORIGIN}`);
    console.log("========================================");
})
    .on("error", (err) => {
    console.error("❌ Erro ao iniciar servidor:", err);
});
exports.default = app;
