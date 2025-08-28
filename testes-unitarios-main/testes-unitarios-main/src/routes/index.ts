import { Router, Request, Response } from "express";
import person from "./person";
import car from "./car";
import phone from "./phone";
import carbyperson from "./carbyperson";

import operacao from "./operacao";

const routes = Router();

routes.use("/operacao", operacao);
routes.use("/pessoa", person);
routes.use("/carro", car);
routes.use("/telefone", phone);
routes.use("/carros_por_pessoa", carbyperson);

//aceita qualquer método HTTP ou URL
routes.use( (_:Request,res:Response) => res.json({error:"Requisição desconhecida"}) );

export default routes;
