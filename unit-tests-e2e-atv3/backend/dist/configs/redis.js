"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DISABLE_REDIS = void 0;
exports.getRedis = getRedis;
exports.redisSafeGet = redisSafeGet;
exports.redisSafeSetex = redisSafeSetex;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({
    path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
    quiet: true,
});
const ioredis_1 = __importDefault(require("ioredis"));
// Permite desligar Redis totalmente (ex.: DISABLE_REDIS=true)
exports.DISABLE_REDIS = String(process.env.DISABLE_REDIS || "").toLowerCase() === "true";
const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = Number(process.env.REDIS_PORT ?? 6379);
const redisPassword = process.env.REDIS_PASSWORD;
const redisOptions = {
    host: redisHost,
    port: redisPort,
    // reduz bloqueio quando o Redis está offline
    retryStrategy: (times) => Math.min(times * 100, 2000),
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    lazyConnect: true, // só conecta quando chamarmos .connect()
};
if (redisPassword)
    redisOptions.password = redisPassword;
let client = null;
async function getRedis() {
    if (exports.DISABLE_REDIS)
        return null;
    if (!client) {
        client = new ioredis_1.default(redisOptions);
        client.on("error", (err) => console.error("Erro no Redis:", err?.message || err));
        try {
            await client.connect();
        }
        catch (e) {
            console.warn("Redis indisponível; seguindo sem blacklist.", e?.message || e);
            return null; // não derruba a app
        }
    }
    return client;
}
// helpers seguros para usar no resto do código
async function redisSafeGet(key) {
    try {
        const r = await getRedis();
        if (!r)
            return null;
        return await r.get(key);
    }
    catch (e) {
        console.warn("Falha ao GET no Redis:", e?.message || e);
        return null;
    }
}
async function redisSafeSetex(key, ttlSec, value) {
    try {
        const r = await getRedis();
        if (!r)
            return false;
        await r.setex(key, ttlSec, value);
        return true;
    }
    catch (e) {
        console.warn("Falha ao SETEX no Redis:", e?.message || e);
        return false;
    }
}
