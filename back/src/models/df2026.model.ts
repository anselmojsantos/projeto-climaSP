import { pool } from "../config/pool.js";

type NumericValue = number | string | null;

export interface Df2026Row {
    Ano: NumericValue;
    Temporada: string;
    NINO34_MM3: NumericValue;
    Fase: string | null;
    Origem: string | null; 
}

export async function FindDf2026ByTempory(
    Temporada: string,
): Promise<Df2026Row | null> {
    const { rows } = await pool.query<Df2026Row>(
        `
         SELECT "Ano", "Temporada", "NINO34_MM3", "Fase", "Origem"        
         FROM df_2026 
         WHERE UPPER("Temporada") = UPPER($1)
         ORDER BY "Ano", "index"
         LIMIT 1
        `,[Temporada],
    );
    return rows[0] ?? null;
}

export async function FindTemporadas2026(): Promise<Df2026Row[]> {
    const { rows } = await pool.query<Df2026Row>(
        `
         SELECT "Ano", "Temporada", "NINO34_MM3", "Fase", "Origem"
         FROM df_2026
         ORDER BY "index"
        `,
    );
    return rows;
}

/** Última temporada observada, para o card do home não ficar preso em JAS. */
export async function FindUltimoObservado(): Promise<Df2026Row | null> {
    const { rows } = await pool.query<Df2026Row>(
        `
         SELECT "Ano", "Temporada", "NINO34_MM3", "Fase", "Origem"
         FROM df_2026
         WHERE UPPER("Origem") = 'OBSERVADO'
         ORDER BY "Ano" DESC, "index" DESC
         LIMIT 1
        `,
    );
    return rows[0] ?? null;
}

/** Projeção mais distante: a última temporada prevista, já em 2027. */
export async function FindUltimaProjecao(): Promise<Df2026Row | null> {
    const { rows } = await pool.query<Df2026Row>(
        `
         SELECT "Ano", "Temporada", "NINO34_MM3", "Fase", "Origem"
         FROM df_2026
         WHERE UPPER("Origem") = 'PREVISTO'
         ORDER BY "Ano" DESC, "index" DESC
         LIMIT 1
        `,
    );
    return rows[0] ?? null;
}