"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({
    path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
    quiet: true, // <— sem logs
});
const pg_1 = require("pg");
function makePool() {
    return new pg_1.Pool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: String(process.env.DB_PASSWORD),
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT),
    });
}
let pool;
if (process.env.NODE_ENV === "test") {
    const g = globalThis;
    pool = g.pool ?? (g.pool = makePool());
}
else {
    pool = makePool();
}
exports.default = pool;
