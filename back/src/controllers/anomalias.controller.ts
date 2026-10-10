import type { FastifyReply, FastifyRequest } from "fastify";
import {
	FindAnomaliasRegioes,
	FindUltimaMediaMensal,
} from "../models/anomalias.model.js";
import { PresentAnomaliasRegioes } from "../views/anomalias.view.js";

export async function GetAnomaliasRegioes(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	try {
		const [rows, mediaMensal] = await Promise.all([
			FindAnomaliasRegioes(),
			FindUltimaMediaMensal(),
		]);

		if (rows.length === 0) {
			return reply.code(404).send({ message: "Anomalias por região indisponíveis." });
		}

		return reply.send(PresentAnomaliasRegioes(rows, mediaMensal));
	} catch (error) {
		request.log.error({ error }, "Falha ao consultar as anomalias por região");
		return reply.code(500).send({ message: "Falha ao buscar as anomalias por região." });
	}
}
