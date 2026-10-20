import type { FastifyPluginAsync } from "fastify";
import {
	GetAnomaliasRegioes,
	GetMediaMensal,
} from "../controllers/anomalias.controller.js";

const AnomaliasRoutes: FastifyPluginAsync = async (app) => {
	app.get("/regioes", GetAnomaliasRegioes);
	app.get("/media-mensal", GetMediaMensal);
};

export default AnomaliasRoutes;
