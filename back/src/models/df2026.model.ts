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
        `,[Temporada],
    );
    return rows[0] ?? null;
}