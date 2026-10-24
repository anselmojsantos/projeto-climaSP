import { useState } from "react";
import { formatarNumero } from "../../lib/formato";
import { corPorSoma, COR_SEM_LEITURA } from "../../model/paleta";
import { BOUNDS_SP, CORTES_SOMA_MM, RAIO_MAX, RAIO_MIN } from "../../model/limiares";
import { CONTORNO_SP } from "../../model/contorno-sp";
import type { Estacao } from "../../model/types";

const LARGURA = 380;
const ALTURA = 420;
const MARGEM = { topo: 16, direita: 16, base: 32, esquerda: 16 };

const LARGURA_PLOT = LARGURA - MARGEM.esquerda - MARGEM.direita;
const ALTURA_PLOT = ALTURA - MARGEM.topo - MARGEM.base;

const LAT_MEDIA = (BOUNDS_SP.latMin + BOUNDS_SP.latMax) / 2;
const COS_LAT_MEDIA = Math.cos((LAT_MEDIA * Math.PI) / 180);
const LARGURA_GEO = (BOUNDS_SP.lonMax - BOUNDS_SP.lonMin) * COS_LAT_MEDIA;
const ALTURA_GEO = BOUNDS_SP.latMax - BOUNDS_SP.latMin;
const ESCALA = Math.min(LARGURA_PLOT / LARGURA_GEO, ALTURA_PLOT / ALTURA_GEO);
const OFFSET_X = MARGEM.esquerda + (LARGURA_PLOT - LARGURA_GEO * ESCALA) / 2;
const OFFSET_Y = MARGEM.topo + (ALTURA_PLOT - ALTURA_GEO * ESCALA) / 2;

interface Props {
	estacoes: Estacao[];
}

function projetar(estacao: Estacao): { x: number; y: number } | null {
	const { latitude: lat, longitude: lon } = estacao;
	if (lat === null || lon === null) return null;
	if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

	const { latMin, latMax, lonMin, lonMax } = BOUNDS_SP;
	if (lat < latMin || lat > latMax || lon < lonMin || lon > lonMax) return null;

	const x = OFFSET_X + (lon - lonMin) * COS_LAT_MEDIA * ESCALA;
	const y = OFFSET_Y + (latMax - lat) * ESCALA;
	return { x, y };
}

function caminhoContorno(pontos: ReadonlyArray<readonly [number, number]>): string {
	const { latMax, lonMin } = BOUNDS_SP;
	return pontos
		.map(([lon, lat], i) => {
			const x = OFFSET_X + (lon - lonMin) * COS_LAT_MEDIA * ESCALA;
			const y = OFFSET_Y + (latMax - lat) * ESCALA;
			return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
		})
		.join(" ") + " Z";
}

function raio(nObs: number | null): number {
	if (nObs === null || nObs === 0) return RAIO_MIN;
	const proporcao = Math.min(nObs / 1000, 1);
	return RAIO_MIN + proporcao * (RAIO_MAX - RAIO_MIN);
}

export default function MapaEstacoes({ estacoes }: Props) {
	const [hover, setHover] = useState<string | null>(null);

	const pontos = estacoes
		.map((e) => ({ estacao: e, pos: projetar(e) }))
		.filter((p): p is { estacao: Estacao; pos: { x: number; y: number } } => p.pos !== null)
		.sort((a, b) => raio(b.estacao.nObs) - raio(a.estacao.nObs));

	if (pontos.length === 0) {
		return (
			<p className="mt-5 mb-0 text-[14px] text-ink-secondary">
				Sem coordenadas para exibir o mapa.
			</p>
		);
	}

	const destaque = pontos.find((p) => p.estacao.codEstacao === hover);

	return (
		<figure className="m-0 flex flex-col gap-3 rounded-2xl bg-soft p-4">
			<div className="w-full">
				<svg
					viewBox={`0 0 ${LARGURA} ${ALTURA}`}
					className="mx-auto block h-auto w-full"
					role="img"
					aria-label={`Mapa de ${pontos.length} estações do CEMADEN em São Paulo, coloridas por soma de chuva no mês.`}
				>

					<rect
						x={MARGEM.esquerda}
						y={MARGEM.topo}
						width={LARGURA_PLOT}
						height={ALTURA_PLOT}
						className="fill-bg stroke-data-neutral/20"
						strokeWidth={1}
					/>
					{pontos.map(({ estacao, pos }) => {
						const cor =
							estacao.situacao === "sem_leitura"
								? COR_SEM_LEITURA
								: corPorSoma(estacao.somaMm, CORTES_SOMA_MM);
						const ativo = hover === estacao.codEstacao;
						return (
							<circle
								key={estacao.codEstacao}
								cx={pos.x}
								cy={pos.y}
								r={raio(estacao.nObs)}
								fill={cor}
								stroke={ativo ? "#000" : "#fff"}
								strokeWidth={ativo ? 2 : 1}
								opacity={hover && !ativo ? 0.4 : 0.9}
								onMouseEnter={() => setHover(estacao.codEstacao)}
								onMouseLeave={() => setHover(null)}
								className="cursor-pointer transition-opacity"
							>
								<title>
									{`${estacao.nomeEstacao} (${estacao.municipio})`}
								</title>
							</circle>
						);
					})}
				</svg>
			</div>

			<figcaption className="flex flex-col gap-2 text-[14px] leading-[1.45] text-data-neutral">
				<p className="m-0">
					<span className="font-semibold text-ink-secondary">Cada ponto</span> é uma
					estação. A <strong>cor</strong> indica a soma de chuva no mês (mm) e o{" "}
					<strong>tamanho</strong> indica o número de leituras — pontos menores têm mais
					lacunas.
				</p>

				{destaque && (
					<p className="m-0 rounded-xl bg-bg p-3">
						<span className="font-semibold text-ink-secondary">
							{destaque.estacao.nomeEstacao}
						</span>{" "}
						· {destaque.estacao.municipio}/{destaque.estacao.uf} ·{" "}
						{formatarNumero(destaque.estacao.somaMm, 1)} mm ·{" "}
						{formatarNumero(destaque.estacao.nObs, 0)} leituras ·{" "}
						{formatarNumero(destaque.estacao.pctHorasComChuva, 0)}% horas com chuva
					</p>
				)}

				<div className="flex flex-wrap items-center gap-2">
					<span className="text-ink-secondary">Escala (mm):</span>
					{CORTES_SOMA_MM.map((corte) => (
						<span key={corte} className="flex items-center gap-1">
							<span
								className="h-3 w-3 rounded-full"
								style={{ backgroundColor: corPorSoma(corte, CORTES_SOMA_MM) }}
							/>
							{corte}+
						</span>
					))}
					<span className="flex items-center gap-1">
						<span
							className="h-3 w-3 rounded-full"
							style={{ backgroundColor: COR_SEM_LEITURA }}
						/>
						sem leitura
					</span>
				</div>
			</figcaption>
		</figure>
	);
}