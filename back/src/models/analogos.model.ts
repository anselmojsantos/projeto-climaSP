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
	DJF: NumericValue;
	JFM: NumericValue;
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

/**
 * Temporadas futuras observadas de cada ano.
 *
 * SON, OND e NDJ caem no proprio ano do ASO. DJF e JFM caem no ano seguinte,
 * porque um trimestre e nomeado pelo mes central: DJF termina em janeiro.
 */
export async function FindFuturoAnalogos(): Promise<FuturoRow[]> {
	const { rows } = await pool.query<FuturoRow>(
		`
		 SELECT y."YR" AS "Ano",
		        max(CASE WHEN y."SEAS" = 'ASO' THEN y."ANOM" END) AS "ASO",
		        max(CASE WHEN y."SEAS" = 'SON' THEN y."ANOM" END) AS "SON",
		        max(CASE WHEN y."SEAS" = 'OND' THEN y."ANOM" END) AS "OND",
		        max(CASE WHEN y."SEAS" = 'NDJ' THEN y."ANOM" END) AS "NDJ",
		        (SELECT max(n."ANOM") FROM df_hist_roni n
		          WHERE n."YR" = y."YR" + 1 AND n."SEAS" = 'DJF') AS "DJF",
		        (SELECT max(n."ANOM") FROM df_hist_roni n
		          WHERE n."YR" = y."YR" + 1 AND n."SEAS" = 'JFM') AS "JFM"
		 FROM df_hist_roni y
		 WHERE y."SEAS" IN ('ASO', 'SON', 'OND', 'NDJ')
		 GROUP BY y."YR"
		 ORDER BY y."YR"
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
