import { Request, Response } from "express";
import { CarByPerson } from "../models";

class CarByPersonController {
  public async create(req: Request, res: Response): Promise<Response> {
    const { car, person } = req.body;
    try {
      const document = new CarByPerson({ car, person });
      // ao salvar serão aplicadas as validações do esquema
      const response = await document.save();
      return res.json(response);
    } catch (error: any) {
      if (error && error.errors["car"]) {
        return res.json({ message: error.errors["car"].message });
      } else if (error && error.errors["person"]) {
        return res.json({ message: error.errors["person"].message });
      }
      return res.json({ message: error });
    }
  }

  public async list(req: Request, res: Response): Promise<Response> {
    const { person } = req.body; // _id da pessoa da chave estrangeira
    try {
      // O método populate('car') diz ao Mongoose para substituir o ID
      // da chave estrangeira pelos documentos da coleção cars
      const objects = await CarByPerson.find({ person })
        .populate("car")
        .select("car");
      return res.json(objects);
    } catch (error: any) {
      return res.json({ message: error.message });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    const { id: _id } = req.body; // _id do registro a ser excluído
    try {
      const object = await CarByPerson.findByIdAndDelete(_id);
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
    const { id, car, person } = req.body;
    try {
      // busca o gasto existente na coleção antes de fazer o update
      const document = await CarByPerson.findById(id);
      if (!document) {
        return res.json({ message: "Registro inexistente" });
      }
      // atualiza os campos
      document.person = person;
      document.car = car;
      // ao salvar serão aplicadas as validações do esquema
      const response = await document.save();
      return res.json(response);
    } catch (error: any) {
      if (error && error.errors["car"]) {
        return res.json({ message: error.errors["car"].message });
      } else if (error && error.errors["person"]) {
        return res.json({ message: error.errors["person"].message });
      }
      return res.json({ message: error });
    }
  }
}

export default new CarByPersonController();
