import type { FastifyPluginAsync } from "fastify";
import { GetOcorrencias } from "../controllers/ocorrencias.controller.js";

const OcorrenciasRoutes: FastifyPluginAsync = async (app) => {
	app.get("/", GetOcorrencias);
};

export default OcorrenciasRoutes;
