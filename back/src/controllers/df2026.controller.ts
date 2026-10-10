import type { FastifyReply, FastifyRequest } from "fastify";
import { FindDf2026ByTempory } from "../models/df2026.model.js";
import { PresentDf2026 } from "../views/df2026.view.js";

interface QueryParams {
	temporada?: string;
}

export async function GetDf2026ByTempory(
	request: FastifyRequest<{ Querystring: QueryParams }>,
	reply: FastifyReply,
) {
	try {
		const temporada = request.query.temporada?.trim();

		if (!temporada) {
			return reply.code(400).send({ message: "O parâmetro 'temporada' é obrigatório." });
		}

		const row = await FindDf2026ByTempory(temporada);

		if (!row) {
			return reply.code(404).send({ message: "Nenhum registro encontrado para a temporada informada." });
		}

		return reply.send(PresentDf2026(row));
	} catch (error) {
		request.log.error({ error }, "Falha ao consultar df_2026");
		return reply.code(500).send({ message: "Falha ao buscar o registro de df_2026." });
	}
}
