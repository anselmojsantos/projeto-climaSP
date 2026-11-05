import type { FastifyReply, FastifyRequest } from "fastify";
import {
	FindChuva2026,
	FindChuvaCenario,
	FindChuvaConcentracao,
	FindChuvaIntensidade,
	FindChuvaPorFase,
} from "../models/chuvas.model.js";
import {
	PresentCaso2026,
	PresentCenario,
	PresentConcentracao,
	PresentFasesChuva,
	PresentIntensidade,
} from "../views/chuvas.view.js";

export async function GetChuvasFases(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	try {
		const rows = await FindChuvaPorFase();
		if (rows.length === 0) {
			return reply.code(404).send({ message: "Série de chuva indisponível." });
		}
		return reply.send(PresentFasesChuva(rows));
	} catch (error) {
		request.log.error({ error }, "Falha ao consultar a chuva por fase do ENSO");
		return reply.code(500).send({ message: "Falha ao buscar a chuva por fase." });
	}
}

export async function GetChuvasIntensidade(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	try {
		const rows = await FindChuvaIntensidade();
		if (rows.length === 0) {
			return reply.code(404).send({ message: "Intensidade indisponível." });
		}
		return reply.send(PresentIntensidade(rows));
	} catch (error) {
		request.log.error({ error }, "Falha ao consultar a intensidade da chuva");
		return reply
			.code(500)
			.send({ message: "Falha ao buscar a intensidade da chuva." });
	}
}

export async function GetChuvasConcentracao(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	try {
		const rows = await FindChuvaConcentracao();
		if (rows.length === 0) {
			return reply.code(404).send({ message: "Concentração indisponível." });
		}
		return reply.send(PresentConcentracao(rows));
	} catch (error) {
		request.log.error({ error }, "Falha ao consultar a concentração da chuva");
		return reply
			.code(500)
			.send({ message: "Falha ao buscar a concentração da chuva." });
	}
}

export async function GetChuvasCenario(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	try {
		const rows = await FindChuvaCenario();
		if (rows.length === 0) {
			return reply.code(404).send({ message: "Cenário indisponível." });
		}
		return reply.send(PresentCenario(rows));
	} catch (error) {
		request.log.error({ error }, "Falha ao consultar o cenário de chuva");
		return reply.code(500).send({ message: "Falha ao buscar o cenário." });
	}
}

export async function GetChuvas2026(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	try {
		const rows = await FindChuva2026();
		if (rows.length === 0) {
			return reply.code(404).send({ message: "Caso 2026 indisponível." });
		}
		return reply.send(PresentCaso2026(rows));
	} catch (error) {
		request.log.error({ error }, "Falha ao consultar o caso de 2026");
		return reply.code(500).send({ message: "Falha ao buscar o caso de 2026." });
	}
}
