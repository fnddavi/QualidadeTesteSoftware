import { Request, Response } from "express";
import { Car } from "../models";

export class CarController {
  public async create(req: Request, res: Response): Promise<Response> {
    const { model } = req.body;
    try {
      //a instância de um modelo é chamada de documento
      const document = new Car({ model });
      // ao salvar serão aplicadas as validações do esquema
      const resp = await document.save();
      return res.json(resp);
    } catch (error: any) {
      if (error.code === 11000 || error.code === 11001) {
        // código 11000 e 11001 indica violação de restrição única (índice duplicado)
        return res.json({ message: "Este modelo já está em uso" });
      } else if (error && error.errors["model"]) {
        return res.json({ message: error.errors["model"].message });
      }
      return res.json({ message: error.message });
    }
  }

  public async list(_: Request, res: Response): Promise<Response> {
    try {
      const objects = await Car.find().sort({ model: "asc" });
      return res.json(objects);
    } catch (error: any) {
      return res.json({ message: error.message });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    const { id: _id } = req.body; // _id do registro a ser excluído
    try {
      const object = await Car.findByIdAndDelete(_id);
      if (object) {
        return res.json({ message: "Registro excluído com sucesso" });
      } else {
        return res.json({ message: "Registro inexistente" });
      }
    } catch (error: any) {
      return res.json({ message: error.message });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    const { id, model } = req.body;
    try {
      // busca o registro na coleção antes de fazer o update
      const document = await Car.findById(id);
      if (!document) {
        return res.json({ message: "Carro inexistente" });
      }
      // atualiza o campo
      document.model = model;
      // ao salvar serão aplicadas as validações do esquema
      const resp = await document.save();
      return res.json(resp);
    } catch (error: any) {
      if (error.code === 11000 || error.code === 11001) {
        // código 11000 e 11001 indica violação de restrição única (índice duplicado)
        return res.json({ message: "Este modelo já está em uso" });
      } else if (error && error.errors["model"]) {
        return res.json({ message: error.errors["model"].message });
      }
      return res.json({ message: error.message });
    }
  }
}

export default new CarController();
