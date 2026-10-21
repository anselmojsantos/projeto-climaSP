import type { FastifyReply, FastifyRequest } from "fastify";
import { FindSerieHistorica } from "../models/serie-historica.model.js";
import { PresentSerieHistorica } from "../views/serie-historica.view.js";

export async function GetSerieHistorica(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	try {
		const rows = await FindSerieHistorica();

		if (rows.length === 0) {
			return reply.code(404).send({ message: "Série histórica do RONI indisponível." });
		}

		return reply.send(PresentSerieHistorica(rows));
	} catch (error) {
		request.log.error({ error }, "Falha ao consultar a série histórica do RONI");
		return reply.code(500).send({ message: "Falha ao buscar a série histórica do RONI." });
	}
}
