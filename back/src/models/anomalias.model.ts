import { pool } from "../config/pool.js";

type NumericValue = number | string | null;

export interface AnomaliaRegiaoRow {
	regiao: string;
	media_anomalia: NumericValue;
	percentual_el_nino: NumericValue;
	latitude: string | null;
	longitude: string | null;
	descricao: string | null;
}

export interface MediaMensalRow {
	index: number;
	nino12: NumericValue;
	nino3: NumericValue;
	nino34: NumericValue;
	nino4: NumericValue;
}

export interface MediaMensalSerieRow extends MediaMensalRow {
	observation_date: string | null;
}

/**
 * Resumo por região Niño usado na tabela "Onde o NOAA mede o El Niño".
 *
 * As colunas de df_anomalias foram criadas com identificadores entre aspas
 * (case-sensitive), então toda referência precisa delas.
 */
export async function FindAnomaliasRegioes(): Promise<AnomaliaRegiaoRow[]> {
	const { rows } = await pool.query<AnomaliaRegiaoRow>(
		`
		 SELECT "Região" AS regiao,
		        "Média das anomalias (°C)" AS media_anomalia,
		        ROUND((100.0 * "El Niño (>= 0.5°C)")::numeric, 2) AS percentual_el_nino,
		        "Latitude" AS latitude,
		        "Longitude" AS longitude,
		        "Descrição" AS descricao
		 FROM df_anomalia_anual
		 ORDER BY "index"
		`,
	);
	return rows;
}

/** Última linha de df_media_mensal: as médias do mês mais recente por região Niño. */
export async function FindUltimaMediaMensal(): Promise<MediaMensalRow | null> {
	const { rows } = await pool.query<MediaMensalRow>(
		`
		 SELECT "index", nino12, nino3, nino34, nino4
		 FROM df_media_mensal
		 ORDER BY "observation_date" DESC
		 LIMIT 1
		`,
	);
	return rows[0] ?? null;
}

/**
 * Série completa de df_media_mensal: a média mensal de cada região Niño ao longo
 * do período do estudo. O texto da data vem no formato ISO, consumido pela view
 * para rotular o mês.
 */
export async function FindMediaMensal(): Promise<MediaMensalSerieRow[]> {
	const { rows } = await pool.query<MediaMensalSerieRow>(
		`
		 SELECT "index", observation_date::text AS observation_date,
		        nino12, nino3, nino34, nino4
		 FROM df_media_mensal
		 ORDER BY observation_date
		`,
	);
	return rows;
}
