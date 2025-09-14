// types/global.d.ts

// Removido: "import type { Request } from 'express';" pois não é necessário para augmentation.
import type { Pool } from "pg";
import type Redis from "ioredis";

// Este tipo pode ser exportado se você o utiliza em outros lugares
export type UserPayload = {
  id: string;
  username: string;
  email?: string;
};

declare global {
  // Os "eslint-disable" podem ser removidos se o linter não reclamar mais deles
  // eslint-disable-next-line no-var
  var pool: Pool;
  // eslint-disable-next-line no-var
  var redis: Redis;

  // Aumenta a interface Request do Express para incluir a propriedade "user"
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

// "export {}" garante que este arquivo seja tratado como um módulo. Mantenha-o.
export {};

// Todo o bloco de código duplicado a partir daqui foi removido.
