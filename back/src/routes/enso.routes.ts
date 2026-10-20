import type { FastifyPluginAsync } from "fastify";
import { GetAnalogos } from "../controllers/analogos.controller.js";
import { GetEnsoSinal } from "../controllers/enso.controller.js";

const EnsoRoutes: FastifyPluginAsync = async (app) => {
	app.get("/sinal", GetEnsoSinal);
	app.get("/analogos", GetAnalogos);
};

export default EnsoRoutes;
