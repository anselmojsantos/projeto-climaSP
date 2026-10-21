import type { FastifyReply, FastifyRequest } from "fastify";
import { FindAnalogos, FindCandidatos, FindFuturoAnalogos } from "../models/analogos.model.js";
import { FindTemporadas2026 } from "../models/df2026.model.js";
import { PresentAnalogos } from "../views/analogos.view.js";

export async function GetAnalogos(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	try {
		const [analogos, temporadas, candidatos, futuro] = await Promise.all([
			FindAnalogos(),
			FindTemporadas2026(),
			FindCandidatos(),
			FindFuturoAnalogos(),
		]);

		if (analogos.length === 0) {
			return reply.code(404).send({ message: "Análogos indisponíveis." });
		}

		return reply.send(PresentAnalogos(analogos, temporadas, candidatos, futuro));
	} catch (error) {
		request.log.error({ error }, "Falha ao consultar os análogos de 2026");
		return reply.code(500).send({ message: "Falha ao buscar os análogos de 2026." });
	}
}
