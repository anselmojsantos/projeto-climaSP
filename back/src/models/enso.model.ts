import { pool } from "../config/pool.js";

type NumericValue = number | string | null;

export interface WeeklyRow {
	observation_date: string | null;
	nino34: NumericValue;
}

export interface WeeklyCoverage {
	first_observation_date: string | null;
	last_observation_date: string | null;
	total_weeks: NumericValue;
}

export interface FrequenciaElNino {
	regiao: string;
	percentual: NumericValue;
}

export async function FindLatestWeekly(): Promise<WeeklyRow | null> {
	const { rows } = await pool.query<WeeklyRow>(
		`
		 SELECT observation_date, nino34
		 FROM df_noaa_weekly
		 ORDER BY observation_date DESC
		 LIMIT 1
		`,
	);
	return rows[0] ?? null;
}

export async function GetWeeklyCoverage(): Promise<WeeklyCoverage | null> {
	const { rows } = await pool.query<WeeklyCoverage>(
		`
		 SELECT MIN(observation_date) AS first_observation_date,
		        MAX(observation_date) AS last_observation_date,
		        COUNT(*) AS total_weeks
		 FROM df_noaa_weekly
		`,
	);
	return rows[0] ?? null;
}

export async function GetFrequenciaElNino34(): Promise<FrequenciaElNino | null> {
	const { rows } = await pool.query<FrequenciaElNino>(
		`
		 SELECT "Região" AS regiao,
		        ROUND((100.0 * "El Niño (>= 0.5°C)")::numeric, 2) AS percentual
		 FROM df_anomalia_anual
		 WHERE UPPER("Região") = 'NIÑO 3.4'
		 LIMIT 1
		`,
	);
	return rows[0] ?? null;
}
