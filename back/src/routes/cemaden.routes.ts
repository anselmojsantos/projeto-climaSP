import type { FastifyPluginAsync } from "fastify";
import {
	GetCemadenEstacoes,
	GetCemadenMensal,
	GetCemadenMensalGeral,
	GetCemadenMeses,
} from "../controllers/cemaden.controller.js";

const CemadenRoutes: FastifyPluginAsync = async (app) => {
	app.get("/mensal", GetCemadenMensal);
	app.get("/mensal-geral", GetCemadenMensalGeral);
	app.get("/meses", GetCemadenMeses);
	app.get("/estacoes", GetCemadenEstacoes);
};

export default CemadenRoutes;
