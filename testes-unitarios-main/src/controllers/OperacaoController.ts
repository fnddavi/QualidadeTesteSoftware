import { Request, Response } from "express";

export class OperacaoControlador {
  public async sum(req: Request, res: Response): Promise<Response> {
    let { x, y } = req.body;
    if (x && y) {
      x = parseInt(x);
      y = parseInt(y);
      if (isNaN(x) || isNaN(y)) {
        return res.json({ message: "Parâmetros não são números" });
      }
      return res.json({ r: x + y });
    }
    return res.json({ message: "Parâmetros inválidos" });
  }

  public async power(req: Request, res: Response): Promise<Response> {
    let { x, y }:any  = req.params;
    x = parseInt(x);
    y = parseInt(y);
    if (isNaN(x) || isNaN(y)) {
      return res.send({ message: "Parâmetros não são números" });
    }
    return res.send({ r: x ** y });
  }
}

export default new OperacaoControlador();
