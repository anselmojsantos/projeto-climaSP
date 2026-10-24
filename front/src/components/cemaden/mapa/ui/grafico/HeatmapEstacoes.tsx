import { useState } from "react";
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
import ModalEstacoes from "../../ui/cemaden-mensal/ModalEstacoes";

interface Props {
	estacoes: Estacao[];
	compacto?: boolean;
}

interface Celula {
	col: number;
	lin: number;
	valores: number[];
	nomes: string[];
	estacoes: Estacao[]; // Guarda os dados para o modal
}

function celulaDe(
	lat: number,
	lon: number,
	colunas: number,
	linhas: number,
): { col: number; lin: number } | null {
	const { latMin, latMax, lonMin, lonMax } = BOUNDS_SP;
	if (lat < latMin || lat > latMax || lon < lonMin || lon > lonMax) return null;
	const col = Math.min(
		colunas - 1,
		Math.floor(((lon - lonMin) / (lonMax - lonMin)) * colunas),
	);
	const lin = Math.min(
		linhas - 1,
		Math.floor(((latMax - lat) / (latMax - latMin)) * linhas),
	);
	return { col, lin };
}

export default function HeatmapEstacoes({
	estacoes,
	compacto = false,
}: Props) {
	const [celulaSelecionada, setCelulaSelecionada] = useState<Celula | null>(null);

	const ALTURA_GEO_BASE = 400;
	const LARGURA_GEO_BASE = compacto ? 300 : 550;

	const COLUNAS = compacto ? 6 : HEATMAP_COLUNAS;
	const LINHAS = compacto ? 8 : HEATMAP_LINHAS;

	const LAT_MEDIA = (BOUNDS_SP.latMin + BOUNDS_SP.latMax) / 2;
	const COS_LAT_MEDIA = Math.cos((LAT_MEDIA * Math.PI) / 180);
	const LARGURA_GEO = (BOUNDS_SP.lonMax - BOUNDS_SP.lonMin) * COS_LAT_MEDIA;
	const ALTURA_GEO = BOUNDS_SP.latMax - BOUNDS_SP.latMin;

	const ESCALA = Math.max(
		LARGURA_GEO_BASE / LARGURA_GEO,
		ALTURA_GEO_BASE / ALTURA_GEO,
	);
	const OFFSET_X = (LARGURA_GEO_BASE - LARGURA_GEO * ESCALA) / 2;
	const OFFSET_Y = (ALTURA_GEO_BASE - ALTURA_GEO * ESCALA) / 2;

	const CELULA_LARGURA = (LARGURA_GEO * ESCALA) / COLUNAS;
	const CELULA_ALTURA = (ALTURA_GEO * ESCALA) / LINHAS;

	const mapa = new Map<string, Celula>();
	for (const e of estacoes) {
		if (e.latitude === null || e.longitude === null) continue;
		if (e.somaMm === null || !Number.isFinite(e.somaMm)) continue;
		const cel = celulaDe(e.latitude, e.longitude, COLUNAS, LINHAS);
		if (!cel) continue;
		const chave = `${cel.col},${cel.lin}`;
		let c = mapa.get(chave);
		if (!c) {
			c = { col: cel.col, lin: cel.lin, valores: [], nomes: [], estacoes: [] };
			mapa.set(chave, c);
		}
		c.valores.push(e.somaMm);
		c.nomes.push(e.nomeEstacao);
		c.estacoes.push(e);
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

	let minCol = COLUNAS, maxCol = 0;
	let minLin = LINHAS, maxLin = 0;
	celulas.forEach((c) => {
		if (c.col < minCol) minCol = c.col;
		if (c.col > maxCol) maxCol = c.col;
		if (c.lin < minLin) minLin = c.lin;
		if (c.lin > maxLin) maxLin = c.lin;
	});

	const viewBoxX = compacto ? x(minCol) : 0;
	const viewBoxY = compacto ? y(minLin) : y(minLin) - CELULA_ALTURA * 0.5;

	const viewBoxW = compacto
		? x(maxCol) - viewBoxX + CELULA_LARGURA
		: LARGURA_GEO_BASE;

	const viewBoxH = compacto
		? y(maxLin) - viewBoxY + CELULA_ALTURA
		: y(maxLin) + CELULA_ALTURA - viewBoxY + CELULA_ALTURA * 0.5;

	return (
		<figure className="m-0 flex flex-col gap-3 rounded-2xl bg-soft p-4">
			<div
				className={`w-full overflow-hidden rounded-xl bg-bg ${
					compacto ? "h-[280px]" : "h-[400px]"
				}`}
			>
				<svg
					viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxW} ${viewBoxH}`}
					preserveAspectRatio="xMidYMid meet"
					className="w-full h-full"
					role="img"
					aria-label={`Heatmap de ${estacoes.length} estações`}
				>
					{Array.from({ length: LINHAS * COLUNAS }).map((_, i) => {
						const col = i % COLUNAS;
						const lin = Math.floor(i / COLUNAS);
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
									onClick={() => cel && setCelulaSelecionada(cel)}
									className={cel ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
								>
									{cel ? (
										<title>
											{`${cel.valores.length} ${
												cel.valores.length === 1 ? "estação" : "estações"
											} · média ${formatarNumero(media, 1)} mm\n${cel.nomes.join(" · ")}`}
										</title>
									) : (
										<title>Sem estação com leitura</title>
									)}
								</rect>

								{cel && (
									<text
										x={x(col) + CELULA_LARGURA / 2}
										y={y(lin) + CELULA_ALTURA / 2}
										textAnchor="middle"
										dominantBaseline="middle"
										className={`fill-ink-primary font-medium pointer-events-none ${
											compacto ? "text-[14px]" : "text-[12px]"
										}`}
									>
										{media!.toFixed(0)}
									</text>
								)}
							</g>
						);
					})}
				</svg>
			</div>

			{!compacto && (
				<figcaption className="flex flex-col gap-2 text-[14px] leading-[1.45] text-data-neutral">
					<p className="m-0">
						<span className="font-semibold text-ink-secondary">Cada célula</span>{" "}
						agrega as estações que caem nela. A <strong>cor</strong> indica a média de
						chuva no mês (mm); células claras não têm estação com leitura. Clique numa
						célula para ver detalhes. Clique nas células para visualiza-las
					</p>
					<p className="m-0 text-[12px] text-ink-secondary">
						{estacoes.length} estações · {celulas.length} células com leitura
					</p>
					<div className="flex flex-wrap items-center gap-2 mt-2">
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

			{celulaSelecionada && (
				<ModalEstacoes
					titulo="Estações da Célula"
					estacoes={celulaSelecionada.estacoes}
					onFechar={() => setCelulaSelecionada(null)}
				/>
			)}
		</figure>
	);
}