import type {
	AnomaliaRegiaoRow,
	MediaMensalRow,
	MediaMensalSerieRow,
} from "../models/anomalias.model.js";

type NumericValue = number | string | null;
type Intervalo = [number, number];

// df_media_mensal.index segue a ordem dos meses do estudo (1 = jan ... 9 = set/2026).
const MESES = [
	"jan",
	"fev",
	"mar",
	"abr",
	"mai",
	"jun",
	"jul",
	"ago",
	"set",
	"out",
	"nov",
	"dez",
];
const ANO_ESTUDO = 2026;

export interface RegiaoAnomaliaView {
	regiao: string;
	localizacao: string;
	percentualElNino: NumericValue;
	mediaAnomalia: NumericValue;
	mediaMensal: NumericValue;
	guia: boolean;
	bounds: { lat: Intervalo; lon: Intervalo } | null;
}

export interface AnomaliasRegioesView {
	regioes: RegiaoAnomaliaView[];
	mesReferencia: string | null;
}

type ColunaMediaMensal = "nino12" | "nino3" | "nino34" | "nino4";

/** Mapeia o nome da região de df_anomalias para a coluna de df_media_mensal. */
function colunaMediaMensal(regiao: string): ColunaMediaMensal | null {
	if (regiao.includes("1+2")) return "nino12";
	if (regiao.includes("3.4")) return "nino34";
	if (regiao.includes("3")) return "nino3";
	if (regiao.includes("4")) return "nino4";
	return null;
}

function mesReferenciaDe(mediaMensal: MediaMensalRow | null): string | null {
	if (!mediaMensal) return null;
	const mes = MESES[mediaMensal.index - 1];
	return mes ? `${mes}/${ANO_ESTUDO}` : null;
}

function montarLocalizacao(row: AnomaliaRegiaoRow): string {
	return [row.latitude, row.longitude, row.descricao]
		.map((parte) => parte?.trim())
		.filter((parte): parte is string => Boolean(parte))
		.join(" · ");
}

/** Niño 1+2 é a região-guia do estudo (maior anomalia e vínculo com o clima de SP). */
function ehRegiaoGuia(regiao: string): boolean {
	return regiao.includes("1+2");
}

/**
 * Latitude/Longitude em df_anomalias são texto (ex.: "0°–10° Sul", "160°E–150°W").
 * O sinal vem por hemisfério (N/S, E/W ou Norte/Sul, Leste/Oeste); quando só o
 * segundo termo traz o hemisfério, ele vale para o par.
 */
function hemisferio(token: string, eixo: "lat" | "lon"): number | null {
	const letras = token.replace(/[^a-zA-Z]/g, "").toLowerCase();
	if (eixo === "lat") {
		if (letras.includes("norte") || letras === "n") return 1;
		if (letras.includes("sul") || letras === "s") return -1;
		return null;
	}
	if (letras.includes("leste") || letras === "e") return 1;
	if (letras.includes("oeste") || letras === "w") return -1;
	return null;
}

function valoresDoEixo(texto: string, eixo: "lat" | "lon"): number[] {
	const tokens = texto
		.replace(/[–—−]/g, "-")
		.split("-")
		.map((token) => token.trim())
		.filter(Boolean);

	const itens = tokens
		.map((token) => {
			const numero = Number.parseFloat(token.replace(",", "."));
			return Number.isFinite(numero)
				? { numero, hemi: hemisferio(token, eixo) }
				: null;
		})
		.filter((item): item is { numero: number; hemi: number | null } => item !== null);

	const hemiPadrao = itens.map((item) => item.hemi).find((hemi) => hemi !== null) ?? 1;
	return itens.map((item) => (item.hemi ?? hemiPadrao) * item.numero);
}

function montarBounds(
	row: AnomaliaRegiaoRow,
): { lat: Intervalo; lon: Intervalo } | null {
	if (!row.latitude || !row.longitude) return null;

	const lat = valoresDoEixo(row.latitude, "lat");
	const lon = valoresDoEixo(row.longitude, "lon");
	if (lat.length === 0 || lon.length === 0) return null;

	const latBounds: Intervalo = [Math.min(...lat), Math.max(...lat)];

	// 160°E–150°W cruza o antimeridiano: mantém a ordem e soma 360 ao fim.
	const [lonPrimeiro, lonSegundo] = lon;
	const lonBounds: Intervalo =
		lonPrimeiro !== undefined && lonSegundo !== undefined && lonPrimeiro > lonSegundo
			? [lonPrimeiro, lonSegundo + 360]
			: [Math.min(...lon), Math.max(...lon)];

	return { lat: latBounds, lon: lonBounds };
}

export function PresentAnomaliasRegioes(
	rows: AnomaliaRegiaoRow[],
	mediaMensal: MediaMensalRow | null,
): AnomaliasRegioesView {
	return {
		regioes: rows.map((row) => {
			const coluna = colunaMediaMensal(row.regiao);
			return {
				regiao: row.regiao,
				localizacao: montarLocalizacao(row),
				percentualElNino: row.percentual_el_nino,
				mediaAnomalia: row.media_anomalia,
				mediaMensal: coluna && mediaMensal ? mediaMensal[coluna] : null,
				guia: ehRegiaoGuia(row.regiao),
				bounds: montarBounds(row),
			};
		}),
		mesReferencia: mesReferenciaDe(mediaMensal),
	};
}

const REGIOES_MEDIA = [
	{ chave: "nino12", nome: "Niño 1+2" },
	{ chave: "nino3", nome: "Niño 3" },
	{ chave: "nino34", nome: "Niño 3.4" },
	{ chave: "nino4", nome: "Niño 4" },
] as const;

export interface PontoMediaMensalView {
	mes: string;
	rotulo: string;
	nino12: number | null;
	nino3: number | null;
	nino34: number | null;
	nino4: number | null;
}

export interface MediaMensalView {
	ano: number;
	regioes: { chave: string; nome: string }[];
	serie: PontoMediaMensalView[];
}

/** df_media_mensal guarda NUMERIC, que o driver entrega como texto. */
function paraNumero(valor: NumericValue): number | null {
	if (valor === null) return null;
	const numero = typeof valor === "number" ? valor : Number.parseFloat(valor);
	return Number.isFinite(numero) ? numero : null;
}

/** A coluna é double precision: 3 casas bastam e evitam ruído de ponto flutuante. */
function paraNumeroMensal(valor: NumericValue): number | null {
	const numero = paraNumero(valor);
	return numero === null ? null : Math.round(numero * 1000) / 1000;
}

/**
 * Extrai o mês do texto ISO (AAAA-MM-DD) sem passar por Date: converter para
 * Date interpretaria a data como UTC e, em UTC-3, o mês anterior.
 */
function mesDoTexto(data: string | null): string | null {
	if (!data) return null;
	const mes = Number.parseInt(data.slice(5, 7), 10);
	if (!Number.isInteger(mes) || mes < 1 || mes > 12) return null;
	return MESES[mes - 1] ?? null;
}

export function PresentMediaMensal(rows: MediaMensalSerieRow[]): MediaMensalView {
	return {
		ano: ANO_ESTUDO,
		regioes: REGIOES_MEDIA.map(({ chave, nome }) => ({ chave, nome })),
		serie: rows.map((row) => {
			const mes = mesDoTexto(row.observation_date) ?? MESES[row.index - 1] ?? "";
			return {
				mes,
				rotulo: `${mes}/${ANO_ESTUDO}`,
				nino12: paraNumeroMensal(row.nino12),
				nino3: paraNumeroMensal(row.nino3),
				nino34: paraNumeroMensal(row.nino34),
				nino4: paraNumeroMensal(row.nino4),
			};
		}),
	};
}
