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

/** Universo de onde saíram os análogos: todos os anos com janela JFM–JAS completa. */
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

export async function FindAnalogos(): Promise<AnalogoRow[]> {
	const { rows } = await pool.query<AnalogoRow>(
		`
		 SELECT "Ano", "JFM", "FMA", "MAM", "AMJ", "MJJ", "JJA", "JAS",
		        "RMSE", "Correlacao", "Amplitude", "trim_divergente"
		 FROM df_analogos
		 ORDER BY "RMSE"
		`,
	);
	return rows;
}
