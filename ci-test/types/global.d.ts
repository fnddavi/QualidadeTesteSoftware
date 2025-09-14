// Tipos globais para o projeto
import type { Request } from 'express';
import type { Pool } from 'pg';
import type Redis from 'ioredis';

export type UserPayload = {
  id: string;
  username: string;
  email?: string;
  // adicione outros campos conforme necessário
};

declare global {
  // eslint-disable-next-line no-var
  var pool: Pool;
  // eslint-disable-next-line no-var
  var redis: Redis;

  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
import type { Pool } from 'pg';
import type Redis from 'ioredis';

declare global {
  // eslint-disable-next-line no-var
  var pool: Pool;
  // eslint-disable-next-line no-var
  var redis: Redis;
}

export {};
