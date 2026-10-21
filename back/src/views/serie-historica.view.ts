import type { SerieHistoricaRow } from "../models/serie-historica.model.js";

export type FaseEnso = "El Niño" | "La Niña" | "Neutro";

export interface SerieHistoricaPonto {
	data: string;
	ano: number;
	estacao: string;
	valor: number;
	fase: FaseEnso;
}

export interface SerieHistoricaView {
	serie: SerieHistoricaPonto[];
}

function classificar(valor: number): FaseEnso {
	if (valor >= 0.5) return "El Niño";
	if (valor <= -0.5) return "La Niña";
	return "Neutro";
}

export function PresentSerieHistorica(rows: SerieHistoricaRow[]): SerieHistoricaView {
	return {
		serie: rows.map((row) => ({
			data: row.data,
			ano: row.ano,
			estacao: row.estacao,
			valor: row.valor,
			fase: classificar(row.valor),
		})),
	};
}
