import type { FastifyPluginAsync } from "fastify";
import AnomaliasRoutes from "./anomalias.routes.js";
import Df2026Routes from "./df2026.routes.js";
import EnsoRoutes from "./enso.routes.js";

const routes: FastifyPluginAsync = async (app) => {
	app.get("/clima", async () => ({
		status: "backend online",
		mensagem: "API ClimaSP disponível.",
	}));
	
	await app.register(Df2026Routes, { prefix: "/enso" });
	await app.register(EnsoRoutes, { prefix: "/enso" });
	await app.register(AnomaliasRoutes, { prefix: "/anomalias" });
};

export default routes;
