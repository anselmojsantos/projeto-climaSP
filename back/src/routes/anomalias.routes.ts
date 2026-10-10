import type { FastifyPluginAsync } from "fastify";
import { GetAnomaliasRegioes } from "../controllers/anomalias.controller.js";

const AnomaliasRoutes: FastifyPluginAsync = async (app) => {
	app.get("/regioes", GetAnomaliasRegioes);
};

export default AnomaliasRoutes;
