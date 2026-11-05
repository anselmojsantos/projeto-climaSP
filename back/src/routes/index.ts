import type { FastifyPluginAsync } from "fastify";
import AnomaliasRoutes from "./anomalias.routes.js";
import ChuvasRoutes from "./chuvas.routes.js";
import Df2026Routes from "./df2026.routes.js";
import EnsoRoutes from "./enso.routes.js";
import CemadenRoutes from "./cemaden.routes.js";
import OcorrenciasRoutes from "./ocorrencias.routes.js";

const routes: FastifyPluginAsync = async (app) => {
	app.get("/clima", async () => ({
		status: "backend online",
		mensagem: "API ClimaSP disponível.",
	}));
	
	await app.register(Df2026Routes, { prefix: "/enso" });
	await app.register(EnsoRoutes, { prefix: "/enso" });
	await app.register(AnomaliasRoutes, { prefix: "/anomalias" });
	await app.register(ChuvasRoutes, { prefix: "/chuvas" });
	await app.register(CemadenRoutes, { prefix: "/cemaden" });
	await app.register(OcorrenciasRoutes, { prefix: "/ocorrencias" });
};

export default routes;
