import { Router } from "express";
import controller from "../controllers/OperacaoController";

const routes = Router();

routes.get('/somar', controller.sum);
routes.get('/potencia/:x/:y', controller.power);

export default routes;