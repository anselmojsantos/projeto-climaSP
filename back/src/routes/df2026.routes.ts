import type { FastifyPluginAsync } from "fastify";
import { GetDf2026ByTempory } from "../controllers/df2026.controller.js";

const Df2026Routes: FastifyPluginAsync = async (app) => {
	app.get("/2026", GetDf2026ByTempory);
};

export default Df2026Routes;
