import type { Df2026Row } from "../models/df2026.model.js";
import type {
	FrequenciaElNino,
	WeeklyCoverage,
	WeeklyRow,
} from "../models/enso.model.js";

type NumericValue = number | string | null;

interface LeituraDf2026 {
	evento: string | null;
	temporada: string;
	ano: NumericValue;
	origem: string | null;
	nino34_mm3: NumericValue;
}

export interface EnsoSinalView {
	oni: LeituraDf2026;
	projecao: LeituraDf2026;
	weekly: {
		observation_date: string | null;
		nino34: NumericValue;
	};
	coverage: {
		first_observation_date: string | null;
		last_observation_date: string | null;
		total_weeks: NumericValue;
	};
	frequencia: {
		regiao: string;
		percentual: NumericValue;
	};
}

function presentLeituraDf2026(row: Df2026Row): LeituraDf2026 {
	return {
		evento: row.Fase,
		temporada: row.Temporada,
		ano: row.Ano,
		origem: row.Origem,
		nino34_mm3: row.NINO34_MM3,
	};
}

export function PresentEnsoSinal(
	oni: Df2026Row,
	projecao: Df2026Row,
	weekly: WeeklyRow,
	coverage: WeeklyCoverage,
	frequencia: FrequenciaElNino,
): EnsoSinalView {
	return {
		oni: presentLeituraDf2026(oni),
		projecao: presentLeituraDf2026(projecao),
		weekly: {
			observation_date: weekly.observation_date,
			nino34: weekly.nino34,
		},
		coverage: {
			first_observation_date: coverage.first_observation_date,
			last_observation_date: coverage.last_observation_date,
			total_weeks: coverage.total_weeks,
		},
		frequencia: {
			regiao: frequencia.regiao,
			percentual: frequencia.percentual,
		},
	};
}
