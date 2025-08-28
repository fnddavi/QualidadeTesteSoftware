import { Request, Response } from "express";
import { Person } from "../models";

class PersonController {
  public async create(req: Request, res: Response): Promise<Response> {
    const { name } = req.body;
    try {
      //a instância de um modelo é chamada de documento
      const document = new Person({ name });
      // ao salvar serão aplicadas as validações do esquema
      const resp = await document.save();
      return res.json(resp);
    } catch (error: any) {
      if (error.code === 11000 || error.code === 11001) {
        // código 11000 e 11001 indica violação de restrição única (índice duplicado)
        return res.json({ message: "Este nome já está em uso" });
      } else if (error && error.errors["name"]) {
        return res.json({ message: error.errors["name"].message });
      }
      return res.json({ message: error.message });
    }
  }

  public async list(_: Request, res: Response): Promise<Response> {
    try {
      const objects = await Person.find().sort({ name: "asc" });
      return res.json(objects);
    } catch (error: any) {
      return res.json({ message: error.message });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    const { id: _id } = req.body; // _id do registro a ser excluído
    try {
      const object = await Person.findByIdAndDelete(_id);
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
    const { id, name } = req.body;
    try {
      // busca o registro na coleção antes de fazer o update
      const document = await Person.findById(id);
      if (!document) {
        return res.json({ message: "Pessoa inexistente" });
      }
      // atualiza o campo
      document.name = name;
      // ao salvar serão aplicadas as validações do esquema
      const resp = await document.save();
      return res.json(resp);
    } catch (error: any) {
      if (error.code === 11000 || error.code === 11001) {
        // código 11000 e 11001 indica violação de restrição única (índice duplicado)
        return res.json({ message: "Este nome já está em uso" });
      } else if (error && error.errors["name"]) {
        return res.json({ message: error.errors["name"].message });
      }
      return res.json({ message: error.message });
    }
  }
}

export default new PersonController();
