import { formatarNumero } from "../../lib/formato";
import { corPorSoma } from "../../model/paleta";
import {
	BOUNDS_SP,
	CORTES_SOMA_MM,
	COR_CELULA_VAZIA,
	HEATMAP_COLUNAS,
	HEATMAP_LINHAS,
} from "../../model/limiares";
import type { Estacao } from "../../model/types";

const MARGEM = { topo: 8, direita: 8, base: 16, esquerda: 8 };
const ASPECT_RATIO = 380 / 420; // largura / altura base

interface Props {
	estacoes: Estacao[];
	largura?: number;
	altura?: number;
	compacto?: boolean;
	responsivo?: boolean;
}

interface Celula {
	col: number;
	lin: number;
	valores: number[];
	nomes: string[];
}

function celulaDe(lat: number, lon: number): { col: number; lin: number } | null {
	const { latMin, latMax, lonMin, lonMax } = BOUNDS_SP;
	if (lat < latMin || lat > latMax || lon < lonMin || lon > lonMax) return null;
	const col = Math.min(
		HEATMAP_COLUNAS - 1,
		Math.floor(((lon - lonMin) / (lonMax - lonMin)) * HEATMAP_COLUNAS),
	);
	const lin = Math.min(
		HEATMAP_LINHAS - 1,
		Math.floor(((latMax - lat) / (latMax - latMin)) * HEATMAP_LINHAS),
	);
	return { col, lin };
}

export default function HeatmapEstacoes({
	estacoes,
	largura = 380,
	altura = 420,
	compacto = false,
	responsivo = false,
}: Props) {
	const LARGURA_EFETIVA = responsivo ? "100%" : largura;
	const ALTURA_EFETIVA = responsivo ? `calc(100% / ${ASPECT_RATIO})` : altura;

	const LARGURA_BASE = 380;
	const ALTURA_BASE = 420;
	const LARGURA_PLOT = LARGURA_BASE - MARGEM.esquerda - MARGEM.direita;
	const ALTURA_PLOT = ALTURA_BASE - MARGEM.topo - MARGEM.base;

	const LAT_MEDIA = (BOUNDS_SP.latMin + BOUNDS_SP.latMax) / 2;
	const COS_LAT_MEDIA = Math.cos((LAT_MEDIA * Math.PI) / 180);
	const LARGURA_GEO = (BOUNDS_SP.lonMax - BOUNDS_SP.lonMin) * COS_LAT_MEDIA;
	const ALTURA_GEO = BOUNDS_SP.latMax - BOUNDS_SP.latMin;
	const ESCALA = Math.min(LARGURA_PLOT / LARGURA_GEO, ALTURA_PLOT / ALTURA_GEO);
	const OFFSET_X = MARGEM.esquerda + (LARGURA_PLOT - LARGURA_GEO * ESCALA) / 2;
	const OFFSET_Y = MARGEM.topo + (ALTURA_PLOT - ALTURA_GEO * ESCALA) / 2;

	const CELULA_LARGURA = (LARGURA_GEO * ESCALA) / HEATMAP_COLUNAS;
	const CELULA_ALTURA = (ALTURA_GEO * ESCALA) / HEATMAP_LINHAS;

	const mapa = new Map<string, Celula>();
	for (const e of estacoes) {
		if (e.latitude === null || e.longitude === null) continue;
		if (e.somaMm === null || !Number.isFinite(e.somaMm)) continue;
		const cel = celulaDe(e.latitude, e.longitude);
		if (!cel) continue;
		const chave = `${cel.col},${cel.lin}`;
		let c = mapa.get(chave);
		if (!c) {
			c = { col: cel.col, lin: cel.lin, valores: [], nomes: [] };
			mapa.set(chave, c);
		}
		c.valores.push(e.somaMm);
		c.nomes.push(e.nomeEstacao);
	}

	const celulas = Array.from(mapa.values()).map((c) => ({
		...c,
		media: c.valores.reduce((s, v) => s + v, 0) / c.valores.length,
	}));

	if (celulas.length === 0) {
		return (
			<p className="mt-5 mb-0 text-[14px] text-ink-secondary">
				Sem coordenadas ou leituras para exibir o heatmap.
			</p>
		);
	}

	const x = (col: number) => OFFSET_X + col * CELULA_LARGURA;
	const y = (lin: number) => OFFSET_Y + lin * CELULA_ALTURA;

	return (
		<figure className="m-0 flex flex-col gap-3 rounded-2xl bg-soft p-4">
			<div
				className="w-full"
				style={
					{
						"--heatmap-width": LARGURA_EFETIVA,
						"--heatmap-height": ALTURA_EFETIVA,
					} as React.CSSProperties
				}
			>
				<div
					className={responsivo ? "relative w-full" : "w-full"}
					style={
						responsivo
							? { width: "100%", aspectRatio: ASPECT_RATIO }
							: undefined
					}
				>
					<svg
						viewBox={`0 0 ${LARGURA_BASE} ${ALTURA_BASE}`}
						className="w-full h-full"
						role="img"
						aria-label={`Heatmap de ${estacoes.length} estações do CEMADEN em São Paulo, agregadas em ${HEATMAP_COLUNAS}×${HEATMAP_LINHAS} células (${celulas.length} células com leitura), coloridas pela média de chuva no mês.`}
					>
						<rect
							x={MARGEM.esquerda}
							y={MARGEM.topo}
							width={LARGURA_PLOT}
							height={ALTURA_PLOT}
							className="fill-bg stroke-data-neutral/20"
							strokeWidth={1}
						/>

						{Array.from({ length: HEATMAP_LINHAS * HEATMAP_COLUNAS }).map(
							(_, i) => {
								const col = i % HEATMAP_COLUNAS;
								const lin = Math.floor(i / HEATMAP_COLUNAS);
								const cel = mapa.get(`${col},${lin}`);
								const preenchido = !!cel;
								const media = cel
									? cel.valores.reduce((s, v) => s + v, 0) / cel.valores.length
									: null;
								const cor = cel
									? corPorSoma(media!, CORTES_SOMA_MM)
									: COR_CELULA_VAZIA;

								return (
									<g key={`${col}-${lin}`}>
										<rect
											x={x(col)}
											y={y(lin)}
											width={CELULA_LARGURA}
											height={CELULA_ALTURA}
											fill={cor}
											stroke="#fff"
											strokeWidth={0.5}
											opacity={preenchido ? 1 : 0.6}
										>
											{cel ? (
												<title>
													{`${cel.valores.length} estação(ões) · média ${formatarNumero(
														media,
														1,
													)} mm\n${cel.nomes.join(" · ")}`}
												</title>
											) : (
												<title>Sem estação com leitura</title>
											)}
										</rect>

										{cel && CELULA_LARGURA > 20 && (
											<text
												x={x(col) + CELULA_LARGURA / 2}
												y={y(lin) + CELULA_ALTURA / 2}
												textAnchor="middle"
												dominantBaseline="middle"
												className="fill-ink-primary text-[6px] font-medium pointer-events-none"
											>
												{media!.toFixed(0)}
											</text>
										)}
									</g>
								);
							},
						)}
					</svg>
				</div>
			</div>

			{!compacto && (
				<figcaption className="flex flex-col gap-2 text-[14px] leading-[1.45] text-data-neutral">
					<p className="m-0">
						<span className="font-semibold text-ink-secondary">Cada célula</span>{" "}
						agrega as estações que caem nela. A <strong>cor</strong> indica a média de
						chuva no mês (mm); células claras não têm estação com leitura.
					</p>

					<p className="m-0 text-[12px] text-ink-secondary">
						{estacoes.length} estações · {celulas.length} células com leitura
					</p>

					<div className="flex flex-wrap items-center gap-2">
						<span className="text-ink-secondary">Escala (mm):</span>
						{CORTES_SOMA_MM.map((corte) => (
							<span key={corte} className="flex items-center gap-1">
								<span
									className="h-3 w-3 rounded-sm"
									style={{ backgroundColor: corPorSoma(corte, CORTES_SOMA_MM) }}
								/>
								{corte}+
							</span>
						))}
						<span className="flex items-center gap-1">
							<span
								className="h-3 w-3 rounded-sm"
								style={{ backgroundColor: COR_CELULA_VAZIA }}
							/>
							sem leitura
						</span>
					</div>
				</figcaption>
			)}
		</figure>
	);
}