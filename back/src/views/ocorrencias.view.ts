import type { OcorrenciaRow } from "../models/ocorrencias.model.js";

type NumericValue = number | string | null;

/** Palavras que ficam minúsculas no meio do nome do local. */
const CONECTORES = new Set(["de", "do", "da", "dos", "das", "e"]);

function numero(valor: NumericValue): number | null {
	if (valor === null) return null;
	const convertido = typeof valor === "number" ? valor : Number(valor);
	return Number.isFinite(convertido) ? convertido : null;
}

function capitalizar(nome: string): string {
	return nome
		.toLowerCase()
		.split("/")
		.map((parte) =>
			parte
				.split(" ")
				.map((palavra) =>
					palavra && !CONECTORES.has(palavra)
						? palavra.charAt(0).toUpperCase() + palavra.slice(1)
						: palavra,
				)
				.join(" "),
		)
		.join("/");
}

/**
 * A fonte grava o mesmo local em caixas diferentes ("CL - CAMPO LIMPO" e
 * "CL - Campo Limpo"), o que duplicaria a coluna na tabela. A sigla fica
 * maiúscula e o nome é capitalizado; acentos não são inventados.
 */
export function normalizarLocal(valor: string | null): string {
	if (!valor) return "";
	const separador = valor.indexOf(" - ");
	if (separador < 0) return capitalizar(valor);
	const sigla = valor.slice(0, separador).toUpperCase();
	return `${sigla} - ${capitalizar(valor.slice(separador + 3))}`;
}

export interface OcorrenciaView {
	id: string;
	dia: string;
	tipo: string;
	local: string;
	zona: string | null;
	latitude: number | null;
	longitude: number | null;
}

export interface OcorrenciaDiaView {
	dia: string;
	total: number;
}

export interface OcorrenciasView {
	total: number;
	dias: OcorrenciaDiaView[];
	ocorrencias: OcorrenciaView[];
}

export function PresentOcorrencias(rows: OcorrenciaRow[]): OcorrenciasView {
	const ocorrencias: OcorrenciaView[] = rows
		.map((row) => ({
			id: row.cd_identificador,
			dia: row.dt_ocorrencia,
			tipo: row.dc_tipo_ocorrencia,
			local: normalizarLocal(row.nm_subprefeitura),
			zona: row.zona,
			latitude: numero(row.latitude),
			longitude: numero(row.longitude),
		}))
		.sort((a, b) => a.local.localeCompare(b.local, "pt-BR") || a.tipo.localeCompare(b.tipo));

	const contagemPorDia = new Map<string, number>();
	for (const ocorrencia of ocorrencias) {
		contagemPorDia.set(ocorrencia.dia, (contagemPorDia.get(ocorrencia.dia) ?? 0) + 1);
	}

	const dias = [...contagemPorDia.entries()]
		.map(([dia, total]) => ({ dia, total }))
		.sort((a, b) => b.dia.localeCompare(a.dia));

	return { total: ocorrencias.length, dias, ocorrencias };
}
