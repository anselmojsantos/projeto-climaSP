import { pool } from "../config/pool.js";

export interface SerieHistoricaRow {
	data: string;
	ano: number;
	estacao: string;
	valor: number;
}

interface MediaMensalRow {
	ano: number;
	mes: number;
	valor: number;
}

const ESTACOES = [
	"DJF",
	"JFM",
	"FMA",
	"MAM",
	"AMJ",
	"MJJ",
	"JJA",
	"JAS",
	"ASO",
	"SON",
	"OND",
	"NDJ",
] as const;

/**
 * Calcula a temporada mais recente a partir das médias mensais das semanas,
 * enquanto o arquivo oficial do RONI ainda não publicou esse trimestre.
 */
async function FindComplemento(
	historico: SerieHistoricaRow[],
): Promise<SerieHistoricaRow | null> {
	const { rows: mensais } = await pool.query<MediaMensalRow>(
		`
		 SELECT EXTRACT(YEAR FROM observation_date::date)::int AS ano,
		        EXTRACT(MONTH FROM observation_date::date)::int AS mes,
		        AVG(nino34)::float8 AS valor
		 FROM df_noaa_weekly
		 GROUP BY 1, 2
		 ORDER BY 1, 2
		`,
	);

	if (mensais.length < 3) return null;

	const janela = mensais.slice(-3);
	const [primeiro, central, ultimo] = janela;
	if (!primeiro || !central || !ultimo) return null;
	if (primeiro.ano !== ultimo.ano || ultimo.mes - primeiro.mes !== 2) {
		return null;
	}

	const estacao = ESTACOES[central.mes - 1];
	if (!estacao) return null;
	if (historico.some((row) => row.ano === central.ano && row.estacao === estacao)) {
		return null;
	}

	const valor =
		janela.reduce((soma, mes) => soma + Number(mes.valor), 0) / janela.length;

	return {
		data: `${central.ano}-${String(central.mes).padStart(2, "0")}-01`,
		ano: central.ano,
		estacao,
		valor: Math.round(valor * 1000) / 1000,
	};
}

/** RONI por temporada de três meses, de 1950 até a última temporada observada. */
export async function FindSerieHistorica(): Promise<SerieHistoricaRow[]> {
	const { rows } = await pool.query<SerieHistoricaRow>(
		`
		 SELECT data::date::text AS data,
		        "YR"::int AS ano,
		        "SEAS" AS estacao,
		        "ANOM" AS valor
		 FROM df_hist_roni
		 WHERE "ANOM" IS NOT NULL
		 ORDER BY data
		`,
	);

	const complemento = await FindComplemento(rows);
	if (!complemento) return rows;

	return [...rows, complemento].sort((a, b) => a.data.localeCompare(b.data));
}
