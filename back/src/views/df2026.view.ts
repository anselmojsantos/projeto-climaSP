import type { Df2026Row } from "../models/df2026.model.js";

export function PresentDf2026(row: Df2026Row): Df2026Row {
	return {
		Ano: row.Ano,
		Temporada: row.Temporada,
		NINO34_MM3: row.NINO34_MM3,
		Fase: row.Fase,
		Origem: row.Origem,
	};
}

export interface Temporada2026View {
	temporada: string;
	roni: number | null;
	fase: string | null;
	origem: string | null;
}

export interface Temporadas2026View {
	ano: number | null;
	temporadas: Temporada2026View[];
}

function numero(valor: Df2026Row["NINO34_MM3"]): number | null {
	if (valor === null) return null;
	const convertido = typeof valor === "number" ? valor : Number(valor);
	return Number.isFinite(convertido) ? convertido : null;
}

export function PresentTemporadas2026(rows: Df2026Row[]): Temporadas2026View {
	const primeiro = rows[0];

	return {
		ano: primeiro ? numero(primeiro.Ano) : null,
		temporadas: rows.map((row) => ({
			temporada: row.Temporada,
			roni: numero(row.NINO34_MM3),
			fase: row.Fase,
			origem: row.Origem,
		})),
	};
}