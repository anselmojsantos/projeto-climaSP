import type { FastifyPluginAsync } from "fastify";
import {
	GetCemadenMensal,
	GetCemadenMensalGeral,
	GetCemadenMeses,
} from "../controllers/cemaden.controller.js";

const CemadenRoutes: FastifyPluginAsync = async (app) => {
	app.get("/mensal", GetCemadenMensal);
	app.get("/mensal-geral", GetCemadenMensalGeral);
	app.get("/meses", GetCemadenMeses);
};

export default CemadenRoutes;