import type { FastifyReply, FastifyRequest } from "fastify";
import { FindOcorrencias } from "../models/ocorrencias.model.js";
import { PresentOcorrencias } from "../views/ocorrencias.view.js";

export async function GetOcorrencias(request: FastifyRequest, reply: FastifyReply) {
	try {
		const rows = await FindOcorrencias();
		if (rows.length === 0) {
			return reply.code(404).send({ message: "Nenhuma ocorrência disponível." });
		}

		return reply.send(PresentOcorrencias(rows));
	} catch (error) {
		request.log.error({ error }, "Falha ao consultar as ocorrências");
		return reply.code(500).send({ message: "Falha ao buscar as ocorrências." });
	}
}
