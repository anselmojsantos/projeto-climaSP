import type { FastifyReply, FastifyRequest } from "fastify";
import { FindDf2026ByTempory } from "../models/df2026.model.js";
import {
	FindLatestWeekly,
	GetFrequenciaElNino34,
	GetWeeklyCoverage,
} from "../models/enso.model.js";
import { PresentEnsoSinal } from "../views/enso.view.js";

export async function GetEnsoSinal(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	try {
		const [oni, projecao, weekly, coverage, frequencia] = await Promise.all([
			FindDf2026ByTempory("JAS"),
			FindDf2026ByTempory("NDJ"),
			FindLatestWeekly(),
			GetWeeklyCoverage(),
			GetFrequenciaElNino34(),
		]);

		if (!oni || !projecao || !weekly || !coverage || !frequencia) {
			return reply.code(404).send({ message: "Dados do sinal ENSO indisponíveis." });
		}

		return reply.send(PresentEnsoSinal(oni, projecao, weekly, coverage, frequencia));
	} catch (error) {
		request.log.error({ error }, "Falha ao consultar o sinal ENSO");
		return reply.code(500).send({ message: "Falha ao buscar o sinal ENSO." });
	}
}
