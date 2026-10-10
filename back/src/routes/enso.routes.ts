import type { FastifyPluginAsync } from "fastify";
import { GetEnsoSinal } from "../controllers/enso.controller.js";

const EnsoRoutes: FastifyPluginAsync = async (app) => {
	app.get("/sinal", GetEnsoSinal);
};

export default EnsoRoutes;
