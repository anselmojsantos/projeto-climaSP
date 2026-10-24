import type {
	CemadenMensalGeralRow,
	CemadenMensalRow,
} from "../models/cemaden.model.js";

type NumericValue = number | string | null;

function numero(valor: NumericValue): number | null {
	if (valor === null) return null;
	const convertido = typeof valor === "number" ? valor : Number(valor);
	return Number.isFinite(convertido) ? convertido : null;
}

function numero2(valor: NumericValue): number | null {
	const n = numero(valor);
	return n === null ? null : Math.round(n * 100) / 100;
}

export interface EstacaoView {
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
	estacoes: EstacaoView[];
}

export function PresentCemadenMensal(rows: CemadenMensalRow[]): CemadenMensalView {
	const periodo = rows[0]?.periodo ?? "";
	const estacoes: EstacaoView[] = rows.map((row) => ({
		codEstacao: row.codEstacao,
		nomeEstacao: row.nomeEstacao,
		municipio: row.municipio,
		uf: row.uf,
		latitude: numero(row.latitude),
		longitude: numero(row.longitude),
		periodo: row.periodo,
		nObs: numero(row.n_obs),
		somaMm: numero2(row.soma_mm),
		mediaMm: numero2(row.media_mm),
		horasComLeitura: numero(row.horas_com_leitura),
		horasComChuva: numero(row.horas_com_chuva),
		horasSemChuva: numero(row.horas_sem_chuva),
		pctHorasComChuva: numero2(row.pct_horas_com_chuva),
		pctHorasSemChuva: numero2(row.pct_horas_sem_chuva),
		situacao: row.situacao,
	}));

	const somas = estacoes.map((e) => e.somaMm ?? 0);
	const total = somas.reduce((a, b) => a + b, 0);
	const media = somas.length === 0 ? null : Math.round((total / somas.length) * 100) / 100;

	return {
		periodo,
		totalEstacoes: estacoes.length,
		somaTotalMm: Math.round(total * 100) / 100,
		mediaSomaMm: media,
		estacoesComChuva: estacoes.filter((e) => e.situacao === "com_chuva").length,
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
		somaMm: numero2(row.soma_mm),
		mediaMm: numero2(row.media_mm),
		nStMonitCh: numero(row.n_st_monit_ch),
		nStMonitChZ: numero(row.n_st_monit_ch_z),
		nStSemLeitura: numero(row.n_st_sem_leitura),
		nStTotal: numero(row.n_st_total),
		pctStMonitCh: numero2(row.pct_st_monit_ch),
		pctStMonitChZ: numero2(row.pct_st_monit_ch_z),
		pctStSemLeitura: numero2(row.pct_st_sem_leitura),
	};
}

export interface CemadenMesesView {
	meses: string[];
}

export function PresentCemadenMeses(meses: string[]): CemadenMesesView {
	return { meses };
}