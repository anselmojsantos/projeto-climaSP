import type { FastifyPluginAsync } from "fastify";
import {
	GetDf2026ByTempory,
	GetTemporadas2026,
} from "../controllers/df2026.controller.js";

const Df2026Routes: FastifyPluginAsync = async (app) => {
	app.get("/2026", GetDf2026ByTempory);
	app.get("/temporadas", GetTemporadas2026);
};

export default Df2026Routes;
