import { pool } from "../config/pool.js";

type NumericValue = number | string | null;

export interface CemadenMensalRow {
	codEstacao: string;
	nomeEstacao: string;
	municipio: string;
	uf: string;
	latitude: NumericValue;
	longitude: NumericValue;
	periodo: string;
	inicio: string | null;
	fim: string | null;
	n_obs: NumericValue;
	soma_mm: NumericValue;
	media_mm: NumericValue;
	horas_com_leitura: NumericValue;
	horas_com_chuva: NumericValue;
	horas_sem_chuva: NumericValue;
	pct_horas_com_chuva: NumericValue;
	pct_horas_sem_chuva: NumericValue;
	situacao: string | null;
}

export interface CemadenMensalGeralRow {
	periodo: string;
	inicio: string | null;
	fim: string | null;
	n_obs: NumericValue;
	n_estacoes_com_leitura: NumericValue;
	soma_mm: NumericValue;
	media_mm: NumericValue;
	n_st_monit_ch: NumericValue;
	n_st_monit_ch_z: NumericValue;
	n_st_sem_leitura: NumericValue;
	n_st_total: NumericValue;
	pct_st_monit_ch: NumericValue;
	pct_st_monit_ch_z: NumericValue;
	pct_st_sem_leitura: NumericValue;
}

/** Todas as estações de um mês (formato AAAA-MM ou AAAA-MM-DD). */
export async function FindCemadenMensal(periodo: string): Promise<CemadenMensalRow[]> {
	const { rows } = await pool.query<CemadenMensalRow>(
		`
		 SELECT "codEstacao", "nomeEstacao", "municipio", "uf",
		        "latitude", "longitude",
		        "periodo"::text AS "periodo",
		        "inicio"::text AS "inicio",
		        "fim"::text AS "fim",
		        "n_obs", "soma_mm", "media_mm",
		        "horas_com_leitura", "horas_com_chuva", "horas_sem_chuva",
		        "pct_horas_com_chuva", "pct_horas_sem_chuva",
		        "situacao"
		 FROM df_cmd_mensal
		 WHERE date_trunc('month', "periodo") = date_trunc('month', ($1 || '-01')::timestamptz)
		 ORDER BY "soma_mm" DESC NULLS LAST
		`,
		[periodo],
	);
	return rows;
}

/** Resumo geral de um mês. */
export async function FindCemadenMensalGeral(periodo: string): Promise<CemadenMensalGeralRow | null> {
	const { rows } = await pool.query<CemadenMensalGeralRow>(
		`
		 SELECT "periodo"::text AS "periodo",
		        "inicio"::text AS "inicio",
		        "fim"::text AS "fim",
		        "n_obs", "n_estacoes_com_leitura",
		        "soma_mm", "media_mm",
		        "n_st_monit_ch", "n_st_monit_ch_z", "n_st_sem_leitura", "n_st_total",
		        "pct_st_monit_ch", "pct_st_monit_ch_z", "pct_st_sem_leitura"
		 FROM df_cmd_mgeral
		 WHERE date_trunc('month', "periodo") = date_trunc('month', ($1 || '-01')::timestamptz)
		 LIMIT 1
		`,
		[periodo],
	);
	return rows[0] ?? null;
}

/** Lista de meses disponíveis (para o seletor do dashboard). */
export async function FindCemadenMeses(): Promise<string[]> {
	const { rows } = await pool.query<{ periodo: string }>(
		`
		 SELECT DISTINCT to_char("periodo", 'YYYY-MM') AS "periodo"
		 FROM df_cmd_mensal
		 ORDER BY "periodo"
		`,
	);
	return rows.map((r) => r.periodo);
}