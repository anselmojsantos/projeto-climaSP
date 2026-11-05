import type {
	Chuva2026Row,
	ChuvaCenarioRow,
	ChuvaConcentracaoRow,
	ChuvaFaseRow,
	ChuvaIntensidadeRow,
} from "../models/chuvas.model.js";

type NumericValue = number | string | null;

export const FASES = ["El Niño", "Neutro", "La Niña"] as const;

export interface FaseChuvaView {
	fase: string;
	meses: number;
	anomaliaPct: number | null;
}

export interface FasesChuvaView {
	de: number | null;
	ate: number | null;
	zonas: { zona: string; fases: FaseChuvaView[] }[];
}

export type ChaveMetrica =
	| "chuva_mm"
	| "max_dia_mm"
	| "max_1h_mm"
	| "p99_hora_mm"
	| "dias_ge_25"
	| "dias_ge_50";

export interface MetricaIntensidadeView {
	chave: ChaveMetrica;
	nome: string;
	unidade: string;
	coef: number | null;
	pct: number | null;
	/** Só para contagens: quantas vezes o número de dias cresce por °C. */
	fator: number | null;
	p: number | null;
}

export interface ZonaIntensidadeView {
	zona: string;
	metricas: MetricaIntensidadeView[];
}

export interface IntensidadeView {
	zonas: ZonaIntensidadeView[];
}

export interface ConcentracaoZonaView {
	zona: string;
	pctTotal: number | null;
	pctMaxDia: number | null;
	deltaPP: number | null;
	icInf: number | null;
	icSup: number | null;
	significativo: boolean;
}

export interface ConcentracaoView {
	zonas: ConcentracaoZonaView[];
}

export interface CenarioZonaView {
	zona: string;
	mes: string;
	mesNum: number;
	ano: number;
	nino34Projetado: number | null;
	chuvaNormalMm: number | null;
	chuvaEsperadaMm: number | null;
	desvioMm: number | null;
	desvioPct: number | null;
	maiorDiaNormalMm: number | null;
	maiorDiaEsperadoMm: number | null;
}

export interface CenarioView {
	meses: { mes: string; rotulo: string; nino34Projetado: number | null }[];
	zonas: CenarioZonaView[];
}

export interface Mes2026View {
	zona: string;
	mes: string;
	mesNum: number;
	chuvaMm: number | null;
	climaMm: number | null;
	anomaliaMm: number | null;
	anomaliaPct: number | null;
	maxDiaMm: number | null;
	climaMaxDiaMm: number | null;
	max1hMm: number | null;
	p99HoraMm: number | null;
	diasGe25: number | null;
	nino34: number | null;
}

export interface Caso2026View {
	ano: number;
	zonas: Mes2026View[];
}

function numero(valor: NumericValue, casas = 3): number | null {
	if (valor === null) return null;
	const convertido = typeof valor === "number" ? valor : Number(valor);
	if (!Number.isFinite(convertido)) return null;
	const fator = 10 ** casas;
	return Math.round(convertido * fator) / fator;
}

const MESES = [
	"jan",
	"fev",
	"mar",
	"abr",
	"mai",
	"jun",
	"jul",
	"ago",
	"set",
	"out",
	"nov",
	"dez",
];

/** "2027-01" → { mesNum: 1, ano: 2027, rotulo: "jan/2027" }. */
function partesDoMes(mes: string): { mesNum: number; ano: number; rotulo: string } {
	const [anoTexto = "", mesTexto = ""] = mes.split("-");
	const mesNum = Number.parseInt(mesTexto, 10);
	const ano = Number.parseInt(anoTexto, 10);
	const nome = MESES[mesNum - 1] ?? mesTexto;
	return {
		mesNum: Number.isInteger(mesNum) ? mesNum : 0,
		ano: Number.isInteger(ano) ? ano : 0,
		rotulo: `${nome}/${anoTexto}`,
	};
}

export function PresentFasesChuva(rows: ChuvaFaseRow[]): FasesChuvaView {
	const porZona = new Map<string, Map<string, FaseChuvaView>>();
	let de: number | null = null;
	let ate: number | null = null;

	for (const row of rows) {
		const inicio = numero(row.de, 0);
		const fim = numero(row.ate, 0);
		if (inicio !== null && (de === null || inicio < de)) de = inicio;
		if (fim !== null && (ate === null || fim > ate)) ate = fim;

		const fases = porZona.get(row.zona) ?? new Map<string, FaseChuvaView>();
		fases.set(row.fase.trim(), {
			fase: row.fase.trim(),
			meses: row.meses,
			anomaliaPct: numero(row.anomalia_pct, 1),
		});
		porZona.set(row.zona, fases);
	}

	return {
		de,
		ate,
		zonas: [...porZona.entries()].map(([zona, fases]) => ({
			zona,
			fases: FASES.filter((fase) => fases.has(fase)).map(
				(fase) => fases.get(fase)!,
			),
		})),
	};
}

interface DefinicaoMetrica {
	chave: ChaveMetrica;
	nome: string;
	unidade: string;
	coef: keyof ChuvaIntensidadeRow;
	pct: keyof ChuvaIntensidadeRow;
	p: keyof ChuvaIntensidadeRow;
}

const METRICAS: DefinicaoMetrica[] = [
	{
		chave: "chuva_mm",
		nome: "Chuva do mês",
		unidade: "mm/°C",
		coef: "chuva_mm_coef",
		pct: "chuva_mm_pct",
		p: "chuva_mm_p",
	},
	{
		chave: "max_dia_mm",
		nome: "Maior dia do mês",
		unidade: "mm/°C",
		coef: "max_dia_mm_coef",
		pct: "max_dia_mm_pct",
		p: "max_dia_mm_p",
	},
	{
		chave: "max_1h_mm",
		nome: "Maior hora",
		unidade: "mm/°C",
		coef: "max_1h_mm_coef",
		pct: "max_1h_mm_pct",
		p: "max_1h_mm_p",
	},
	{
		chave: "p99_hora_mm",
		nome: "p99 da hora",
		unidade: "mm/°C",
		coef: "p99_hora_mm_coef",
		pct: "p99_hora_mm_pct",
		p: "p99_hora_mm_p",
	},
	{
		chave: "dias_ge_25",
		nome: "Dias ≥ 25 mm",
		unidade: "× por °C",
		coef: "dias_ge_25_coef",
		pct: "dias_ge_25_pct",
		p: "dias_ge_25_p",
	},
	{
		chave: "dias_ge_50",
		nome: "Dias ≥ 50 mm",
		unidade: "× por °C",
		coef: "dias_ge_50_coef",
		pct: "dias_ge_50_pct",
		p: "dias_ge_50_p",
	},
];

export function PresentIntensidade(rows: ChuvaIntensidadeRow[]): IntensidadeView {
	return {
		zonas: rows.map((row) => ({
			zona: row.zona,
			metricas: METRICAS.map(({ chave, nome, unidade, coef, pct, p }) => {
				const coeficiente = numero(row[coef]);
				const ehContagem = chave.startsWith("dias");
				return {
					chave,
					nome,
					unidade,
					coef: coeficiente,
					pct: numero(row[pct], 1),
					fator:
						ehContagem && coeficiente !== null
							? numero(Math.exp(coeficiente), 2)
							: null,
					p: numero(row[p], 3),
				};
			}),
		})),
	};
}

export function PresentConcentracao(
	rows: ChuvaConcentracaoRow[],
): ConcentracaoView {
	return {
		zonas: rows.map((row) => ({
			zona: row.zona,
			pctTotal: numero(row.pct_total, 1),
			pctMaxDia: numero(row.pct_max_dia, 1),
			deltaPP: numero(row.delta_p_pontos, 1),
			icInf: numero(row.ic_inf, 1),
			icSup: numero(row.ic_sup, 1),
			significativo: row.significativo,
		})),
	};
}

export function PresentCenario(rows: ChuvaCenarioRow[]): CenarioView {
	const zonas = rows.map((row) => {
		const { mesNum, ano } = partesDoMes(row.mes);
		return {
			zona: row.zona,
			mes: row.mes,
			mesNum,
			ano,
			nino34Projetado: numero(row.nino34_projetado),
			chuvaNormalMm: numero(row.chuva_normal_mm, 1),
			chuvaEsperadaMm: numero(row.chuva_esperada_mm, 1),
			desvioMm: numero(row.desvio_mm, 1),
			desvioPct: numero(row.desvio_pct, 1),
			maiorDiaNormalMm: numero(row.maior_dia_normal_mm, 1),
			maiorDiaEsperadoMm: numero(row.maior_dia_esperado_mm, 1),
		};
	});

	// Um mês por linha do tempo; o NINO3.4 projetado é o mesmo para todas as zonas.
	const meses = [...new Set(rows.map((row) => row.mes))].map((mes) => {
		const { rotulo } = partesDoMes(mes);
		const referencia = rows.find((row) => row.mes === mes);
		return {
			mes,
			rotulo,
			nino34Projetado: referencia
				? numero(referencia.nino34_projetado)
				: null,
		};
	});

	return { meses, zonas };
}

export function PresentCaso2026(rows: Chuva2026Row[]): Caso2026View {
	const ano =
		rows.map((row) => numero(row.ano, 0)).find((valor) => valor !== null) ?? 2026;

	return {
		ano,
		zonas: rows.map((row) => {
			const { mesNum } = partesDoMes(row.mes);
			return {
				zona: row.zona,
				mes: row.mes,
				mesNum,
				chuvaMm: numero(row.chuva_mm, 1),
				climaMm: numero(row.clima_chuva_mm, 1),
				anomaliaMm: numero(row.anomalia_mm, 1),
				anomaliaPct: numero(row.anomalia_pct, 1),
				maxDiaMm: numero(row.max_dia_mm, 1),
				climaMaxDiaMm: numero(row.clima_max_dia_mm, 1),
				max1hMm: numero(row.max_1h_mm, 1),
				p99HoraMm: numero(row.p99_hora_mm, 1),
				diasGe25: numero(row.dias_ge_25, 0),
				nino34: numero(row.nino34),
			};
		}),
	};
}
