import type {
	CemadenEstacaoRow,
	CemadenMensalGeralRow,
	CemadenMensalRow,
} from "../models/cemaden.model.js";

type NumericValue = number | string | null;

/** Mesmo valor gravado em df_cmd_mensal.situacao pelo notebook. */
const SITUACAO_COM_CHUVA = "com_chuva";

function numero(valor: NumericValue): number | null {
	if (valor === null) return null;
	const convertido = typeof valor === "number" ? valor : Number(valor);
	return Number.isFinite(convertido) ? convertido : null;
}

function numeroArredondado(valor: NumericValue): number | null {
	const convertido = numero(valor);
	return convertido === null ? null : arredondar(convertido);
}

function arredondar(valor: number): number {
	return Math.round(valor * 100) / 100;
}

export interface CemadenEstacaoView {
	codEstacao: string;
	nomeEstacao: string;
	municipio: string;
	uf: string;
	latitude: number | null;
	longitude: number | null;
	periodo: string;
	nObs: number | null;
	somaMm: number | null;
	mediaMm: number | null;
	horasComLeitura: number | null;
	horasComChuva: number | null;
	horasSemChuva: number | null;
	pctHorasComChuva: number | null;
	pctHorasSemChuva: number | null;
	situacao: string | null;
}

export interface CemadenMensalView {
	periodo: string;
	totalEstacoes: number;
	somaTotalMm: number;
	mediaSomaMm: number | null;
	estacoesComChuva: number;
	estacoes: CemadenEstacaoView[];
}

export function PresentCemadenMensal(rows: CemadenMensalRow[]): CemadenMensalView {
	const periodo = rows[0]?.periodo ?? "";
	const estacoes: CemadenEstacaoView[] = rows.map((row) => ({
		codEstacao: row.codEstacao,
		nomeEstacao: row.nomeEstacao,
		municipio: row.municipio,
		uf: row.uf,
		latitude: numero(row.latitude),
		longitude: numero(row.longitude),
		periodo: row.periodo,
		nObs: numero(row.n_obs),
		somaMm: numeroArredondado(row.soma_mm),
		mediaMm: numeroArredondado(row.media_mm),
		horasComLeitura: numero(row.horas_com_leitura),
		horasComChuva: numero(row.horas_com_chuva),
		horasSemChuva: numero(row.horas_sem_chuva),
		pctHorasComChuva: numeroArredondado(row.pct_horas_com_chuva),
		pctHorasSemChuva: numeroArredondado(row.pct_horas_sem_chuva),
		situacao: row.situacao,
	}));

	// Estação sem leitura não tem soma: fica fora da média em vez de puxá-la para baixo.
	const somas = estacoes
		.map((estacao) => estacao.somaMm)
		.filter((soma): soma is number => soma !== null);
	const total = somas.reduce((acumulado, soma) => acumulado + soma, 0);
	const media = somas.length === 0 ? null : arredondar(total / somas.length);

	return {
		periodo,
		totalEstacoes: estacoes.length,
		somaTotalMm: arredondar(total),
		mediaSomaMm: media,
		estacoesComChuva: estacoes.filter((estacao) => estacao.situacao === SITUACAO_COM_CHUVA)
			.length,
		estacoes,
	};
}

export interface CemadenMensalGeralView {
	periodo: string;
	inicio: string | null;
	fim: string | null;
	nObs: number | null;
	nEstacoesComLeitura: number | null;
	somaMm: number | null;
	mediaMm: number | null;
	nStMonitCh: number | null;
	nStMonitChZ: number | null;
	nStSemLeitura: number | null;
	nStTotal: number | null;
	pctStMonitCh: number | null;
	pctStMonitChZ: number | null;
	pctStSemLeitura: number | null;
}

export function PresentCemadenMensalGeral(row: CemadenMensalGeralRow): CemadenMensalGeralView {
	return {
		periodo: row.periodo,
		inicio: row.inicio,
		fim: row.fim,
		nObs: numero(row.n_obs),
		nEstacoesComLeitura: numero(row.n_estacoes_com_leitura),
		somaMm: numeroArredondado(row.soma_mm),
		mediaMm: numeroArredondado(row.media_mm),
		nStMonitCh: numero(row.n_st_monit_ch),
		nStMonitChZ: numero(row.n_st_monit_ch_z),
		nStSemLeitura: numero(row.n_st_sem_leitura),
		nStTotal: numero(row.n_st_total),
		pctStMonitCh: numeroArredondado(row.pct_st_monit_ch),
		pctStMonitChZ: numeroArredondado(row.pct_st_monit_ch_z),
		pctStSemLeitura: numeroArredondado(row.pct_st_sem_leitura),
	};
}

export interface CemadenEstacaoResumoView {
	latitude: number | null;
	longitude: number | null;
	nomeEstacao: string;
	situacao: string | null;
}

export function PresentCemadenEstacoes(
	rows: CemadenEstacaoRow[],
): CemadenEstacaoResumoView[] {
	return rows.map((row) => ({
		latitude: numero(row.latitude),
		longitude: numero(row.longitude),
		nomeEstacao: row.nomeEstacao,
		situacao: row.situacao,
	}));
}

export interface CemadenMesesView {
	meses: string[];
}

export function PresentCemadenMeses(meses: string[]): CemadenMesesView {
	return { meses };
}
