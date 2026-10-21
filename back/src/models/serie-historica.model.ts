import { pool } from "../config/pool.js";

export interface SerieHistoricaRow {
	data: string;
	ano: number;
	estacao: string;
	valor: number;
}

/** RONI por temporada de três meses, de 1950 até a última temporada disponível. */
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

	return rows;
}
