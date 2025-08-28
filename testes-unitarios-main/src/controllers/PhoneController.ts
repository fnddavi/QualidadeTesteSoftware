import { Request, Response } from "express";
import { Phone } from "../models";

class PhoneController {
  public async create(req: Request, res: Response): Promise<Response> {
    const { person, number } = req.body;
    try {
      const document = new Phone({ person, number });
      // ao salvar serão aplicadas as validações do esquema
      const response = await document.save();
      return res.json(response);
    } catch (error: any) {
      if (error && error.errors["number"]) {
        return res.json({ message: error.errors["number"].message });
      } else if (error && error.errors["person"]) {
        return res.json({ message: error.errors["person"].message });
      }
      return res.json({ message: error });
    }
  }

  public async list(req: Request, res: Response): Promise<Response> {
    const { person } = req.body; // _id da pessoa da chave estrangeira
    try {
      // o método select recebe os campos incluídos no resultado
      const objects = await Phone.find({ person })
        .select("number")
        .sort({ number: "asc" });
      return res.json(objects);
    } catch (error: any) {
      return res.json({ message: error.message });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    const { id: _id } = req.body; // _id do registro a ser excluído
    try {
      const object = await Phone.findByIdAndDelete(_id);
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
    const { id, person, number } = req.body;
    try {
      // busca o gasto existente na coleção antes de fazer o update
      const document = await Phone.findById(id);
      if (!document) {
        return res.json({ message: "Telefone inexistente" });
      }
      // atualiza os campos
      document.person = person;
      document.number = number;
      // ao salvar serão aplicadas as validações do esquema
      const response = await document.save();
      return res.json(response);
    } catch (error: any) {
      if (error && error.errors["number"]) {
        return res.json({ message: error.errors["number"].message });
      } else if (error && error.errors["person"]) {
        return res.json({ message: error.errors["person"].message });
      }
      return res.json({ message: error });
    }
  }
}

export default new PhoneController();
