import type { FastifyReply, FastifyRequest } from "fastify";
import {
	FindCemadenEstacoes,
	FindCemadenMensal,
	FindCemadenMensalGeral,
	FindCemadenMeses,
} from "../models/cemaden.model.js";
import {
	PresentCemadenEstacoes,
	PresentCemadenMensal,
	PresentCemadenMensalGeral,
	PresentCemadenMeses,
} from "../views/cemaden.view.js";

interface PeriodoQuery {
	periodo?: string;
}

const PERIODO_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * Valida `AAAA-MM` antes de chegar ao Postgres: sem isso, um formato inválido
 * estoura na conversão para date e o cliente recebe 500 em vez de 400.
 */
function lerPeriodo(request: FastifyRequest<{ Querystring: PeriodoQuery }>): string | null {
	const periodo = request.query.periodo?.trim();
	return periodo && PERIODO_PATTERN.test(periodo) ? periodo : null;
}

export async function GetCemadenMensal(
	request: FastifyRequest<{ Querystring: PeriodoQuery }>,
	reply: FastifyReply,
) {
	try {
		const periodo = lerPeriodo(request);
		if (!periodo) {
			return reply.code(400).send({ message: "Informe o parâmetro 'periodo' no formato AAAA-MM." });
		}

		const rows = await FindCemadenMensal(periodo);
		if (rows.length === 0) {
			return reply.code(404).send({ message: "Nenhuma estação encontrada para o período." });
		}

		return reply.send(PresentCemadenMensal(rows));
	} catch (error) {
		request.log.error({ error }, "Falha ao consultar o CEMADEN mensal");
		return reply.code(500).send({ message: "Falha ao buscar o CEMADEN mensal." });
	}
}

export async function GetCemadenMensalGeral(
	request: FastifyRequest<{ Querystring: PeriodoQuery }>,
	reply: FastifyReply,
) {
	try {
		const periodo = lerPeriodo(request);
		if (!periodo) {
			return reply.code(400).send({ message: "Informe o parâmetro 'periodo' no formato AAAA-MM." });
		}

		const row = await FindCemadenMensalGeral(periodo);
		if (!row) {
			return reply.code(404).send({ message: "Resumo geral indisponível para o período." });
		}

		return reply.send(PresentCemadenMensalGeral(row));
	} catch (error) {
		request.log.error({ error }, "Falha ao consultar o resumo geral do CEMADEN");
		return reply.code(500).send({ message: "Falha ao buscar o resumo geral do CEMADEN." });
	}
}

export async function GetCemadenMeses(request: FastifyRequest, reply: FastifyReply) {
	try {
		const meses = await FindCemadenMeses();
		if (meses.length === 0) {
			return reply.code(404).send({ message: "Nenhum mês disponível." });
		}

		return reply.send(PresentCemadenMeses(meses));
	} catch (error) {
		request.log.error({ error }, "Falha ao listar os meses do CEMADEN");
		return reply.code(500).send({ message: "Falha ao listar os meses do CEMADEN." });
	}
}

export async function GetCemadenEstacoes(
	request: FastifyRequest<{ Querystring: PeriodoQuery }>,
	reply: FastifyReply,
) {
	try {
		const periodo = lerPeriodo(request);
		if (!periodo) {
			return reply.code(400).send({ message: "Informe o parâmetro 'periodo' no formato AAAA-MM." });
		}

		const rows = await FindCemadenEstacoes(periodo);
		if (rows.length === 0) {
			return reply.code(404).send({ message: "Nenhuma estação encontrada para o período." });
		}

		return reply.send(PresentCemadenEstacoes(rows));
	} catch (error) {
		request.log.error({ error }, "Falha ao consultar as estações do CEMADEN");
		return reply.code(500).send({ message: "Falha ao buscar as estações do CEMADEN." });
	}
}
