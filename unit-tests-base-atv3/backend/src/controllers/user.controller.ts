// src/controllers/user.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import db from "../configs/db";
import { generateToken, verifyToken } from "../utils/jwt";
import type { UserPayload } from "../types/express";
import crypto from "crypto";
import { redisSafeSetex } from "../configs/redis"; // <- usa helper seguro (opcional)

//
// Criar usuário
//
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (username, password) VALUES ($1, $2)",
      [username, hashedPassword]
    );

    res.status(201).json({
      success: true,
      data: { message: "Usuário criado com sucesso." },
    });
  } catch (error: any) {
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

//
// Login de usuário
//
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length === 0) {
      res.status(401).json({ success: false, error: "Credenciais inválidas." });
      return;
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ success: false, error: "Credenciais inválidas." });
      return;
    }

    const payload: UserPayload = { id: user.id, username: user.username };
    const token = generateToken(payload);

    res.status(200).json({
      success: true,
      data: {
        message: "Login realizado com sucesso.",
        token,
        user: { id: user.id, username: user.username },
      },
    });
  } catch (_error: any) {
    res.status(500).json({ success: false, error: "Erro ao realizar login." });
  }
};

//
// Logout de usuário
// - Adiciona o token à blacklist no Redis ATÉ expirar, se o Redis estiver disponível.
// - Se o Redis estiver offline/indisponível, responde sucesso do mesmo jeito (não quebra o fluxo).
//
export const logoutUser = async (req: Request, res: Response): Promise<void> => {
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
    const decoded: any = verifyToken(token, true);
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
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Tenta gravar na blacklist; se Redis estiver offline, segue mesmo assim
    const ok = await redisSafeSetex(
      `blacklist:jwt:${tokenHash}`,
      ttl > 0 ? ttl : 60, // se já expirou, põe 60s pra evitar race condition
      "true"
    );

    res.status(200).json({
      success: true,
      data: {
        message: ok
          ? "Logout realizado com sucesso. Token invalidado."
          : "Logout realizado (Redis indisponível, token não foi registrado na blacklist).",
      },
    });
  } catch (_error: any) {
    res.status(500).json({ success: false, error: "Erro ao realizar logout." });
  }
};
