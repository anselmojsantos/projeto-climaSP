import { pool } from "../config/pool.js";

type NumericValue = number | string | null;

export interface AnalogoRow {
	Ano: NumericValue;
	JFM: NumericValue;
	FMA: NumericValue;
	MAM: NumericValue;
	AMJ: NumericValue;
	MJJ: NumericValue;
	JJA: NumericValue;
	JAS: NumericValue;
	ASO: NumericValue;
	RMSE: NumericValue;
	Correlacao: NumericValue;
	Amplitude: NumericValue;
	trim_divergente: NumericValue;
}

export interface CandidatosRow {
	total: number;
	de: NumericValue;
	ate: NumericValue;
}

export interface FuturoRow {
	Ano: NumericValue;
	ASO: NumericValue;
	SON: NumericValue;
	OND: NumericValue;
	NDJ: NumericValue;
}

/** Universo de onde saíram os análogos: todos os anos com janela JFM–ASO completa. */
export async function FindCandidatos(): Promise<CandidatosRow> {
	const { rows } = await pool.query<CandidatosRow>(
		`
		 SELECT count(*)::int AS total,
		        min("Ano") AS de,
		        max("Ano") AS ate
		 FROM df_rank
		`,
	);
	return rows[0] ?? { total: 0, de: null, ate: null };
}

/** SON–NDJ observados de cada ano — janela que a projeção precisa estimar. */
export async function FindFuturoAnalogos(): Promise<FuturoRow[]> {
	const { rows } = await pool.query<FuturoRow>(
		`
		 SELECT "YR" AS "Ano",
		        max(CASE WHEN "SEAS" = 'ASO' THEN "ANOM" END) AS "ASO",
		        max(CASE WHEN "SEAS" = 'SON' THEN "ANOM" END) AS "SON",
		        max(CASE WHEN "SEAS" = 'OND' THEN "ANOM" END) AS "OND",
		        max(CASE WHEN "SEAS" = 'NDJ' THEN "ANOM" END) AS "NDJ"
		 FROM df_hist_roni
		 WHERE "SEAS" IN ('ASO', 'SON', 'OND', 'NDJ')
		 GROUP BY "YR"
		 ORDER BY "YR"
		`,
	);
	return rows;
}

export async function FindAnalogos(): Promise<AnalogoRow[]> {
	const { rows } = await pool.query<AnalogoRow>(
		`
		 SELECT "Ano", "JFM", "FMA", "MAM", "AMJ", "MJJ", "JJA", "JAS", "ASO",
		        "RMSE", "Correlacao", "Amplitude", "trim_divergente"
		 FROM df_analogos
		 ORDER BY "RMSE"
		`,
	);
	return rows;
}
