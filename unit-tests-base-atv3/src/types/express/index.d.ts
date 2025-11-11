import { JwtPayload } from "jsonwebtoken";

export interface UserPayload extends JwtPayload {
  id: string;
  username: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: UserPayload;
  }
}
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
