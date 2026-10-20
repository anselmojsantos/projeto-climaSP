import type { FastifyReply, FastifyRequest } from "fastify";
import {
	FindAnomaliasRegioes,
	FindMediaMensal,
	FindUltimaMediaMensal,
} from "../models/anomalias.model.js";
import {
	PresentAnomaliasRegioes,
	PresentMediaMensal,
} from "../views/anomalias.view.js";

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

export async function GetMediaMensal(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	try {
		const rows = await FindMediaMensal();

		if (rows.length === 0) {
			return reply.code(404).send({ message: "Médias mensais indisponíveis." });
		}

		return reply.send(PresentMediaMensal(rows));
	} catch (error) {
		request.log.error({ error }, "Falha ao consultar as médias mensais");
		return reply.code(500).send({ message: "Falha ao buscar as médias mensais." });
	}
}
