import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
  quiet: true,
});

import Redis from "ioredis";
import type { RedisOptions } from "ioredis";

// Permite desligar Redis totalmente (ex.: DISABLE_REDIS=true)
export const DISABLE_REDIS = String(process.env.DISABLE_REDIS || "").toLowerCase() === "true";

const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = Number(process.env.REDIS_PORT ?? 6379);
const redisPassword = process.env.REDIS_PASSWORD;

const redisOptions: RedisOptions = {
  host: redisHost,
  port: redisPort,
  // reduz bloqueio quando o Redis está offline
  retryStrategy: (times) => Math.min(times * 100, 2000),
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  lazyConnect: true, // só conecta quando chamarmos .connect()
};
if (redisPassword) redisOptions.password = redisPassword;

let client: Redis | null = null;

export async function getRedis() {
  if (DISABLE_REDIS) return null;
  if (!client) {
    client = new Redis(redisOptions);
    client.on("error", (err) => console.error("Erro no Redis:", err?.message || err));
    try {
      await client.connect();
    } catch (e: any) {
      console.warn("Redis indisponível; seguindo sem blacklist.", e?.message || e);
      return null; // não derruba a app
    }
  }
  return client;
}

// helpers seguros para usar no resto do código
export async function redisSafeGet(key: string) {
  try {
    const r = await getRedis();
    if (!r) return null;
    return await r.get(key);
  } catch (e) {
    console.warn("Falha ao GET no Redis:", (e as any)?.message || e);
    return null;
  }
}

export async function redisSafeSetex(key: string, ttlSec: number, value: string) {
  try {
    const r = await getRedis();
    if (!r) return false;
    await r.setex(key, ttlSec, value);
    return true;
  } catch (e) {
    console.warn("Falha ao SETEX no Redis:", (e as any)?.message || e);
    return false;
  }
}
