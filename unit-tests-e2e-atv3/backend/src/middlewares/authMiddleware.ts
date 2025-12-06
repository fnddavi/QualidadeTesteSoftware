import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { redisSafeGet } from "../configs/redis";

interface JwtPayload {
  id: string;
  username: string;
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Token não fornecido" });
    }

    const token = authHeader.slice(7);
    // tenta blacklist só se Redis responder
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const blacklisted = await redisSafeGet(`blacklist:jwt:${tokenHash}`);
    if (blacklisted) {
      return res.status(401).json({ success: false, error: "Token expirado ou inválido" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    (req as any).user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, error: "Token inválido ou expirado" });
  }
}
