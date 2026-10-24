import type { FastifyReply, FastifyRequest } from "fastify";
import {
	FindCemadenMensal,
	FindCemadenMensalGeral,
	FindCemadenMeses,
} from "../models/cemaden.model.js";
import {
	PresentCemadenMensal,
	PresentCemadenMensalGeral,
	PresentCemadenMeses,
} from "../views/cemaden.view.js";

interface QueryPeriodo {
	periodo?: string;
}

export async function GetCemadenMensal(
	request: FastifyRequest<{ Querystring: QueryPeriodo }>,
	reply: FastifyReply,
) {
	try {
		const periodo = request.query.periodo?.trim();
		if (!periodo) {
			return reply.code(400).send({ message: "O parâmetro 'periodo' é obrigatório (AAAA-MM)." });
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
	request: FastifyRequest<{ Querystring: QueryPeriodo }>,
	reply: FastifyReply,
) {
	try {
		const periodo = request.query.periodo?.trim();
		if (!periodo) {
			return reply.code(400).send({ message: "O parâmetro 'periodo' é obrigatório (AAAA-MM)." });
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

export async function GetCemadenMeses(
	request: FastifyRequest,
	reply: FastifyReply,
) {
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