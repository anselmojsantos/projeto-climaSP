import { useState, type PointerEvent as ReactPointerEvent } from "react";
import { caminhoDe } from "../../../lib/svg";
import { formatarNumero } from "../../../lib/formato";
import {
  CORES_FASE,
  LIMIAR_EL_NINO,
  LIMIAR_LA_NINA,
  PASSO_EIXO,
} from "../../../model/limiares";
import type { FaseEnso, PontoSerieHistorica } from "../../model/types";

const LARGURA = 900;
const ALTURA = 360;
const MARGEM = { topo: 26, direita: 34, base: 46, esquerda: 52 };

const LARGURA_PLOT = LARGURA - MARGEM.esquerda - MARGEM.direita;
const ALTURA_PLOT = ALTURA - MARGEM.topo - MARGEM.base;

interface Props {
  serie: PontoSerieHistorica[];
}

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function mesCentral(iso: string): string {
  const [ano, mes] = iso.slice(0, 10).split("-");
  const nome = MESES[Number(mes) - 1];
  return nome && ano ? `${nome} de ${ano}` : iso;
}

export default function GraficoSerieHistorica({ serie }: Props) {
  const [ativo, setAtivo] = useState<number | null>(null);

  if (serie.length === 0) {
    return (
      <p className="mt-5 mb-0 text-[14px] text-ink-secondary">
        Sem série histórica para exibir.
      </p>
    );
  }

  const valores = serie.map((ponto) => ponto.valor);
  const yMin =
    Math.floor(Math.min(LIMIAR_LA_NINA, ...valores) / PASSO_EIXO) * PASSO_EIXO;
  const yMax =
    Math.ceil(Math.max(LIMIAR_EL_NINO, ...valores) / PASSO_EIXO) * PASSO_EIXO;
  const passos = Math.round((yMax - yMin) / PASSO_EIXO);
  const ticks = Array.from({ length: passos + 1 }, (_, i) => yMin + i * PASSO_EIXO);

  const x = (indice: number) =>
    serie.length === 1
      ? MARGEM.esquerda + LARGURA_PLOT / 2
      : MARGEM.esquerda + (indice * LARGURA_PLOT) / (serie.length - 1);
  const y = (valor: number) =>
    MARGEM.topo + ALTURA_PLOT - ((valor - yMin) / (yMax - yMin)) * ALTURA_PLOT;

  const base = MARGEM.topo + ALTURA_PLOT;
  const fim = MARGEM.esquerda + LARGURA_PLOT;

  const marcos = serie.reduce<{ indice: number; ano: number }[]>((lista, ponto, indice) => {
    if (ponto.estacao === "DJF" && ponto.ano % 10 === 0) {
      lista.push({ indice, ano: ponto.ano });
    }
    return lista;
  }, []);

  const ultimo = serie[serie.length - 1]!;
  if (marcos[marcos.length - 1]?.indice !== serie.length - 1) {
    marcos.push({ indice: serie.length - 1, ano: ultimo.ano });
  }

  const trechos: { fase: FaseEnso; indices: number[] }[] = [];
  serie.forEach((ponto, indice) => {
    const atual = trechos[trechos.length - 1];
    if (!atual || atual.fase !== ponto.fase) {
      trechos.push({ fase: ponto.fase, indices: [indice] });
    } else {
      atual.indices.push(indice);
    }
  });

  const caminhoDoTrecho = (indices: number[]) =>
    indices
      .map((indice, posicao) => {
        const ponto = serie[indice]!;
        return `${posicao === 0 ? "M" : "L"} ${x(indice)} ${y(ponto.valor)}`;
      })
      .join(" ");

  const aoMover = (event: ReactPointerEvent<SVGRectElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const caixa = svg.getBoundingClientRect();
    if (caixa.width === 0) return;
    const px = ((event.clientX - caixa.left) / caixa.width) * LARGURA;
    const proporcao = (px - MARGEM.esquerda) / LARGURA_PLOT;
    const indice = Math.round(proporcao * (serie.length - 1));
    const limitado = Math.min(serie.length - 1, Math.max(0, indice));
    setAtivo((atual) => (atual === limitado ? atual : limitado));
  };

  const ativoPonto = ativo === null ? null : (serie[ativo] ?? null);
  const larguraTooltip = 184;
  const alturaTooltip = 54;
  let tooltipX = 0;
  let tooltipY = 0;
  if (ativoPonto && ativo !== null) {
    tooltipX = x(ativo) + 12;
    if (tooltipX + larguraTooltip > fim) tooltipX = x(ativo) - larguraTooltip - 12;
    if (tooltipX < MARGEM.esquerda) tooltipX = MARGEM.esquerda;

    const abaixo = y(ativoPonto.valor) + 12;
    tooltipY =
      abaixo + alturaTooltip <= base
        ? abaixo
        : Math.max(MARGEM.topo, y(ativoPonto.valor) - alturaTooltip - 12);
  }

  return (
    <figure className="m-0 flex flex-col gap-3 rounded-2xl bg-soft p-4">
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${LARGURA} ${ALTURA}`}
          className="mx-auto block h-auto w-full min-w-[640px] max-w-[980px]"
          role="img"
          aria-label={`Série histórica do RONI de ${serie[0]!.ano} a ${ultimo.ano}, colorida pela fase: El Niño acima de +0,5 grau Celsius, La Niña abaixo de -0,5 e neutro entre os dois limiares.`}
        >
          {ticks.map((tick) => (
            <line
              key={`grade-${tick}`}
              x1={MARGEM.esquerda}
              x2={fim}
              y1={y(tick)}
              y2={y(tick)}
              className="stroke-data-neutral/20"
              strokeWidth={1}
            />
          ))}

          {marcos.map((marco) => (
            <line
              key={`grade-ano-${marco.ano}`}
              x1={x(marco.indice)}
              x2={x(marco.indice)}
              y1={MARGEM.topo}
              y2={base}
              className="stroke-data-neutral/15"
              strokeWidth={1}
            />
          ))}

          <line
            x1={MARGEM.esquerda}
            x2={fim}
            y1={y(LIMIAR_EL_NINO)}
            y2={y(LIMIAR_EL_NINO)}
            className="stroke-data-warm/50"
            strokeDasharray="6 4"
            strokeWidth={1.2}
          />
          <line
            x1={MARGEM.esquerda}
            x2={fim}
            y1={y(LIMIAR_LA_NINA)}
            y2={y(LIMIAR_LA_NINA)}
            className="stroke-data-cold/50"
            strokeDasharray="6 4"
            strokeWidth={1.2}
          />
          <line
            x1={MARGEM.esquerda}
            x2={fim}
            y1={y(0)}
            y2={y(0)}
            className="stroke-data-neutral/50"
            strokeDasharray="2 4"
            strokeWidth={1}
          />

          {ticks.map((tick) => (
            <text
              key={`eixo-y-${tick}`}
              x={MARGEM.esquerda - 10}
              y={y(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-data-neutral text-[13px]"
            >
              {formatarNumero(tick, 1)}
            </text>
          ))}

          <path
            d={caminhoDe(valores, x, y)}
            fill="none"
            className="stroke-data-neutral/30"
            strokeWidth={1}
          />

          {trechos.map((trecho, posicao) =>
            trecho.indices.length > 1 ? (
              <path
                key={`trecho-${posicao}`}
                d={caminhoDoTrecho(trecho.indices)}
                fill="none"
                className={CORES_FASE[trecho.fase].traco}
                strokeWidth={2.2}
                strokeLinecap="round"
              />
            ) : (
              <circle
                key={`trecho-${posicao}`}
                cx={x(trecho.indices[0]!)}
                cy={y(serie[trecho.indices[0]!]!.valor)}
                r={2}
                className={CORES_FASE[trecho.fase].ponto}
              />
            ),
          )}

          <circle
            cx={x(serie.length - 1)}
            cy={y(ultimo.valor)}
            r={4}
            className={`${CORES_FASE[ultimo.fase].ponto} stroke-bg`}
            strokeWidth={2}
          >
            <title>
              {`${mesCentral(ultimo.data)}: ${formatarNumero(ultimo.valor)} °C (${ultimo.fase})`}
            </title>
          </circle>

          {marcos.map((marco) => (
            <text
              key={`eixo-x-${marco.ano}`}
              x={x(marco.indice)}
              y={base + 24}
              textAnchor={
                marco.indice === 0
                  ? "start"
                  : marco.indice === serie.length - 1
                    ? "end"
                    : "middle"
              }
              className="fill-ink-secondary text-[13px]"
            >
              {marco.ano}
            </text>
          ))}

          <text
            x={MARGEM.esquerda + LARGURA_PLOT / 2}
            y={ALTURA - 6}
            textAnchor="middle"
            className="fill-ink-secondary text-[13px]"
          >
            Ano
          </text>

          <rect
            x={MARGEM.esquerda}
            y={MARGEM.topo}
            width={LARGURA_PLOT}
            height={ALTURA_PLOT}
            fill="transparent"
            pointerEvents="all"
            style={{ cursor: "crosshair" }}
            onPointerMove={aoMover}
            onPointerLeave={() => setAtivo(null)}
            onPointerCancel={() => setAtivo(null)}
          />

          {ativoPonto && ativo !== null && (
            <g pointerEvents="none">
              <line
                x1={x(ativo)}
                x2={x(ativo)}
                y1={MARGEM.topo}
                y2={base}
                className="stroke-data-neutral/40"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
              <circle
                cx={x(ativo)}
                cy={y(ativoPonto.valor)}
                r={4}
                className={`${CORES_FASE[ativoPonto.fase].ponto} stroke-bg`}
                strokeWidth={2}
              />
              <g transform={`translate(${tooltipX}, ${tooltipY})`}>
                <rect
                  width={larguraTooltip}
                  height={alturaTooltip}
                  rx={6}
                  className="fill-bg stroke-data-neutral/30"
                  strokeWidth={1}
                />
                <text
                  x={10}
                  y={21}
                  className="fill-ink text-[13px] font-semibold"
                >
                  {mesCentral(ativoPonto.data)}
                </text>
                <text x={10} y={39} className="fill-ink-secondary text-[13px]">
                  {`${formatarNumero(ativoPonto.valor)} °C · ${ativoPonto.fase}`}
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>

      <div className="mx-auto flex w-full max-w-[980px] flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-ink-secondary">
        {(["El Niño", "Neutro", "La Niña"] as const).map((fase) => (
          <span key={fase} className="flex items-center gap-1.5">
            <span className={`${CORES_FASE[fase].legenda} h-3 w-3 rounded-full`} />
            {fase}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="h-0 w-5 border-t border-dashed border-ink-secondary" />
          limiares de ±0,5 °C
        </span>
      </div>

      <figcaption className="mx-auto w-full max-w-[980px] text-[13px] leading-[1.45] text-data-neutral">
        Fonte: NOAA CPC — RONI (Relative Oceanic Niño Index).
      </figcaption>
    </figure>
  );
}
