import type { FastifyPluginAsync } from "fastify";
import { GetAnalogos } from "../controllers/analogos.controller.js";
import { GetEnsoSinal } from "../controllers/enso.controller.js";
import { GetSerieHistorica } from "../controllers/serie-historica.controller.js";

const EnsoRoutes: FastifyPluginAsync = async (app) => {
	app.get("/sinal", GetEnsoSinal);
	app.get("/analogos", GetAnalogos);
	app.get("/serie-historica", GetSerieHistorica);
};

export default EnsoRoutes;
