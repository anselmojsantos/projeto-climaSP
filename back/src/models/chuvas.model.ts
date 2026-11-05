import { pool } from "../config/pool.js";

type NumericValue = number | string | null;

export interface ChuvaFaseRow {
	zona: string;
	fase: string;
	meses: number;
	anomalia_pct: NumericValue;
	de: NumericValue;
	ate: NumericValue;
	primeiro_mes: string;
	ultimo_mes: string;
}

export interface ChuvaSerieRow {
	mes: string;
	anomalia_pct: NumericValue;
	nino34: NumericValue;
}

export interface NinoProjetadoRow {
	temporada: string;
	ano: NumericValue;
	nino34: NumericValue;
}

export interface ClimaChuvaRow {
	zona: string;
	mes_num: number;
	clima_mm: NumericValue;
	clima_max_dia_mm: NumericValue;
}

export interface ChuvaIntensidadeRow {
	index: number;
	zona: string;
	chuva_mm_coef: NumericValue;
	chuva_mm_pct: NumericValue;
	chuva_mm_p: NumericValue;
	max_dia_mm_coef: NumericValue;
	max_dia_mm_pct: NumericValue;
	max_dia_mm_p: NumericValue;
	max_1h_mm_coef: NumericValue;
	max_1h_mm_pct: NumericValue;
	max_1h_mm_p: NumericValue;
	p99_hora_mm_coef: NumericValue;
	p99_hora_mm_pct: NumericValue;
	p99_hora_mm_p: NumericValue;
	dias_ge_25_coef: NumericValue;
	dias_ge_25_pct: NumericValue;
	dias_ge_25_p: NumericValue;
	dias_ge_25_fator: NumericValue;
	dias_ge_25_fator_p: NumericValue;
	dias_ge_50_coef: NumericValue;
	dias_ge_50_pct: NumericValue;
	dias_ge_50_p: NumericValue;
}

export interface ChuvaConcentracaoRow {
	index: number;
	zona: string;
	pct_total: NumericValue;
	pct_max_dia: NumericValue;
	delta_p_pontos: NumericValue;
	ic_inf: NumericValue;
	ic_sup: NumericValue;
	significativo: boolean;
}

export interface ChuvaCenarioRow {
	index: number;
	zona: string;
	mes: string;
	nino34_projetado: NumericValue;
	chuva_normal_mm: NumericValue;
	chuva_esperada_mm: NumericValue;
	desvio_mm: NumericValue;
	desvio_pct: NumericValue;
	maior_dia_normal_mm: NumericValue;
	maior_dia_esperado_mm: NumericValue;
}

export interface Chuva2026Row {
	index: number;
	zona: string;
	mes: string;
	chuva_mm: NumericValue;
	max_dia_mm: NumericValue;
	max_1h_mm: NumericValue;
	p99_hora_mm: NumericValue;
	dias_ge_25: NumericValue;
	nino34: NumericValue;
	ano: NumericValue;
	mes_num: NumericValue;
	clima_chuva_mm: NumericValue;
	clima_max_dia_mm: NumericValue;
	anomalia_mm: NumericValue;
	anomalia_pct: NumericValue;
}

/**
 * Média da anomalia mensal em cada fase do ENSO.
 *
 * A fase sai do próprio NINO3.4 de cada mês, com os mesmos limiares de ±0,5 °C
 * usados no resto do projeto. Assim a comparação fala a mesma língua das outras
 * seções, em vez de introduzir um critério novo.
 */
export async function FindChuvaPorFase(): Promise<ChuvaFaseRow[]> {
	const { rows } = await pool.query<ChuvaFaseRow>(
		`
		 SELECT zona,
		        CASE WHEN nino34 >= 0.5 THEN 'El Niño'
		             WHEN nino34 <= -0.5 THEN 'La Niña'
		             ELSE 'Neutro' END AS fase,
		        count(*)::int AS meses,
		        avg(anomalia_pct) AS anomalia_pct,
		        min(ano) AS de,
		        max(ano) AS ate,
		        to_char(min(mes), 'YYYY-MM') AS primeiro_mes,
		        to_char(max(mes), 'YYYY-MM') AS ultimo_mes
		 FROM df_chuva_mensal
		 WHERE nino34 IS NOT NULL AND anomalia_pct IS NOT NULL
		 GROUP BY zona, fase
		 ORDER BY zona, avg(nino34) DESC
		`,
	);
	return rows;
}

/**
 * Série mensal da chuva, já agregada nas cinco zonas.
 *
 * O NINO3.4 é o mesmo em todas as zonas no mesmo mês; a média evita depender
 * da ordem das linhas.
 */
export async function FindChuvaSerie(): Promise<ChuvaSerieRow[]> {
	const { rows } = await pool.query<ChuvaSerieRow>(
		`
		 SELECT to_char(mes, 'YYYY-MM') AS mes,
		        avg(anomalia_pct) AS anomalia_pct,
		        avg(nino34) AS nino34
		 FROM df_chuva_mensal
		 WHERE nino34 IS NOT NULL AND anomalia_pct IS NOT NULL
		 GROUP BY mes
		 ORDER BY mes
		`,
	);
	return rows;
}

/** Projeção do NINO3.4 publicada pelo nooa.ipynb para 2026-2027. */
export async function FindNinoProjetado(): Promise<NinoProjetadoRow[]> {
	const { rows } = await pool.query<NinoProjetadoRow>(
		`
		 SELECT "Temporada" AS temporada,
		        "Ano" AS ano,
		        "NINO34_MM3" AS nino34
		 FROM df_2026
		 WHERE UPPER("Origem") = 'PREVISTO'
		 ORDER BY "Ano", "index"
		`,
	);
	return rows;
}

/** Climatologia de 1991-2020 por zona e mês, usada como linha de base. */
export async function FindClimaChuva(): Promise<ClimaChuvaRow[]> {
	const { rows } = await pool.query<ClimaChuvaRow>(
		`
		 SELECT zona,
		        mes_num,
		        avg(chuva_mm) AS clima_mm,
		        avg(max_dia_mm) AS clima_max_dia_mm
		 FROM df_chuva_mensal
		 WHERE ano BETWEEN 1991 AND 2020
		 GROUP BY zona, mes_num
		 ORDER BY zona, mes_num
		`,
	);
	return rows;
}

export async function FindChuvaIntensidade(): Promise<ChuvaIntensidadeRow[]> {
	const { rows } = await pool.query<ChuvaIntensidadeRow>(
		`
		 SELECT *
		 FROM df_chuva_intensidade
		 ORDER BY "index"
		`,
	);
	return rows;
}

export async function FindChuvaConcentracao(): Promise<ChuvaConcentracaoRow[]> {
	const { rows } = await pool.query<ChuvaConcentracaoRow>(
		`
		 SELECT *
		 FROM df_chuva_concentracao
		 ORDER BY "index"
		`,
	);
	return rows;
}

export async function FindChuvaCenario(): Promise<ChuvaCenarioRow[]> {
	const { rows } = await pool.query<ChuvaCenarioRow>(
		`
		 SELECT "index", zona,
		        to_char(mes, 'YYYY-MM') AS mes,
		        nino34_projetado, chuva_normal_mm, chuva_esperada_mm,
		        desvio_mm, desvio_pct,
		        maior_dia_normal_mm, maior_dia_esperado_mm
		 FROM df_chuva_cenario
		 ORDER BY "index"
		`,
	);
	return rows;
}

export async function FindChuva2026(): Promise<Chuva2026Row[]> {
	const { rows } = await pool.query<Chuva2026Row>(
		`
		 SELECT "index", zona,
		        to_char(mes, 'YYYY-MM') AS mes,
		        chuva_mm, max_dia_mm, max_1h_mm, p99_hora_mm, dias_ge_25,
		        nino34, ano, mes_num, clima_chuva_mm, clima_max_dia_mm,
		        anomalia_mm, anomalia_pct
		 FROM df_chuva_2026
		 ORDER BY "index"
		`,
	);
	return rows;
}
