// src/server.ts
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import router from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

// =========================
// CONFIGURAÇÃO DO AMBIENTE
// =========================
dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
  quiet: true,
});

// =========================
// CONFIGURAÇÕES GERAIS
// =========================
const app = express();
const PORT = Number(process.env.PORT) || 3001;

// FRONT permitido (pode vir do .env)
const FRONT_ORIGIN =
  process.env.FRONT_ORIGIN || "http://localhost:5173";

// =========================
// MIDDLEWARES
// =========================

// Libera o front-end para consumir a API
app.use(
  cors({
    origin: FRONT_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Permite JSON no corpo das requisições
app.use(express.json());

// Permite form-data (x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Suporte a cookies
app.use(cookieParser());

// =========================
// ROTAS PRINCIPAIS
// =========================
app.use("/", router);

// =========================
// ROTA 404
// =========================
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Rota não encontrada",
  });
});

// =========================
// MIDDLEWARE GLOBAL DE ERRO
// =========================
app.use(errorHandler);

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

export default app;
