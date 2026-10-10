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