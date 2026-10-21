import type { AnalogoRow, CandidatosRow, FuturoRow } from "../models/analogos.model.js";
import type { Df2026Row } from "../models/df2026.model.js";

type NumericValue = number | string | null;

/** Janela comum entre o alvo (2026) e cada ano análogo. */
export const TEMPORADAS_JANELA = [
	"JFM",
	"FMA",
	"MAM",
	"AMJ",
	"MJJ",
	"JJA",
	"JAS",
	"ASO",
] as const;

/** Temporadas que a projeção por regressão precisa estimar. */
export const TEMPORADAS_FUTURO = ["SON", "OND", "NDJ"] as const;

export interface AnalogoView {
	ano: number | null;
	valores: (number | null)[];
	futuro: (number | null)[];
	rmse: number | null;
	correlacao: number | null;
	amplitude: number | null;
	trimDivergente: number | null;
}

export interface CandidatosView {
	total: number;
	de: number | null;
	ate: number | null;
}

export interface AnalogosView {
	temporadas: string[];
	alvo: (number | null)[];
	media: (number | null)[];
	candidatos: CandidatosView;
	analogos: AnalogoView[];
	temporadasFuturo: string[];
	alvoFuturo: (number | null)[];
	aso2026: number | null;
}

function numero(valor: NumericValue): number | null {
	if (valor === null) return null;
	const convertido = typeof valor === "number" ? valor : Number(valor);
	return Number.isFinite(convertido) ? convertido : null;
}

/** Série observada de 2026 (JFM–ASO) alinhada à janela dos análogos. */
function alvoDe2026(rows: Df2026Row[]): (number | null)[] {
	const observados = new Map(
		rows
			.filter((row) => row.Origem === "Observado")
			.map((row) => [row.Temporada.trim().toUpperCase(), numero(row.NINO34_MM3)]),
	);

	return TEMPORADAS_JANELA.map((temporada) => observados.get(temporada) ?? null);
}

/** Projeção de 2026 (SON–NDJ) alinhada às temporadas futuras. */
function alvoFuturoDe2026(rows: Df2026Row[]): (number | null)[] {
	const previstos = new Map(
		rows
			.filter((row) => row.Origem?.trim().toUpperCase() === "PREVISTO")
			.map((row) => [row.Temporada.trim().toUpperCase(), numero(row.NINO34_MM3)]),
	);

	return TEMPORADAS_FUTURO.map((temporada) => previstos.get(temporada) ?? null);
}

/** Média dos análogos, temporada a temporada, ignorando valores ausentes. */
function mediaDosAnalogos(analogos: AnalogoView[]): (number | null)[] {
	return TEMPORADAS_JANELA.map((_, indice) => {
		const valores = analogos
			.map((analogo) => analogo.valores[indice])
			.filter((valor): valor is number => valor !== null);

		if (valores.length === 0) return null;

		const media = valores.reduce((soma, valor) => soma + valor, 0) / valores.length;
		return Number(media.toFixed(3));
	});
}

export function PresentAnalogos(
	rows: AnalogoRow[],
	alvoRows: Df2026Row[],
	candidatos: CandidatosRow,
	futuroRows: FuturoRow[],
): AnalogosView {
	const futuroPorAno = new Map<number, FuturoRow>();
	for (const row of futuroRows) {
		const ano = numero(row.Ano);
		if (ano !== null) futuroPorAno.set(ano, row);
	}

	const analogos: AnalogoView[] = rows.map((row) => {
		const ano = numero(row.Ano);
		const futuro = ano !== null ? futuroPorAno.get(ano) : undefined;

		return {
			ano,
			valores: TEMPORADAS_JANELA.map((temporada) => numero(row[temporada])),
			futuro: TEMPORADAS_FUTURO.map((temporada) =>
				futuro ? numero(futuro[temporada]) : null,
			),
			rmse: numero(row.RMSE),
			correlacao: numero(row.Correlacao),
			amplitude: numero(row.Amplitude),
			trimDivergente: numero(row.trim_divergente),
		};
	});

	const alvo2026 = alvoDe2026(alvoRows);
	const aso2026 = alvo2026[TEMPORADAS_JANELA.length - 1] ?? null;

	return {
		temporadas: [...TEMPORADAS_JANELA],
		alvo: alvo2026,
		media: mediaDosAnalogos(analogos),
		candidatos: {
			total: candidatos.total,
			de: numero(candidatos.de),
			ate: numero(candidatos.ate),
		},
		analogos,
		temporadasFuturo: [...TEMPORADAS_FUTURO],
		alvoFuturo: alvoFuturoDe2026(alvoRows),
		aso2026,
	};
}
