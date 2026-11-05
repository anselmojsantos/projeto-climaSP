import type { FastifyPluginAsync } from "fastify";
import {
	GetChuvas2026,
	GetChuvasCenario,
	GetChuvasConcentracao,
	GetChuvasFases,
	GetChuvasIntensidade,
	GetChuvasProjecao,
	GetChuvasSerie,
} from "../controllers/chuvas.controller.js";

const ChuvasRoutes: FastifyPluginAsync = async (app) => {
	app.get("/fases", GetChuvasFases);
	app.get("/serie", GetChuvasSerie);
	app.get("/intensidade", GetChuvasIntensidade);
	app.get("/concentracao", GetChuvasConcentracao);
	app.get("/cenario", GetChuvasCenario);
	app.get("/projecao", GetChuvasProjecao);
	app.get("/caso-2026", GetChuvas2026);
};

export default ChuvasRoutes;
