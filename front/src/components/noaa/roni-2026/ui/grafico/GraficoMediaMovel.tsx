import {
  CORES_FASE,
  FASE_NEUTRA,
  LIMIAR_EL_NINO,
  LIMIAR_LA_NINA,
  PASSO_EIXO,
} from "../../../model/limiares";
import { formatarNumero } from "../../../lib/formato";
import type { PontoRoni } from "../../model/types";

const LARGURA = 520;
const ALTURA = 320;
const MARGEM = { topo: 26, direita: 20, base: 44, esquerda: 48 };

const LARGURA_PLOT = LARGURA - MARGEM.esquerda - MARGEM.direita;
const ALTURA_PLOT = ALTURA - MARGEM.topo - MARGEM.base;

interface Props {
  pontos: PontoRoni[];
}

function corDaFase(fase: string | null) {
  return (fase && CORES_FASE[fase as keyof typeof CORES_FASE]) || FASE_NEUTRA;
}

/** Variação em relação ao ASO, com sinal explícito para não virar ambiguidade. */
function sinalDoDelta(delta: number): string {
  return `${delta >= 0 ? "+" : "−"}${formatarNumero(Math.abs(delta))}`;
}

export default function GraficoMediaMovel({ pontos }: Props) {
  if (pontos.length === 0) {
    return (
      <p className="mt-5 mb-0 text-[14px] text-ink-secondary">
        Sem temporadas para exibir.
      </p>
    );
  }

  const valores = pontos.map((ponto) => ponto.roni);
  const yMin =
    Math.floor(Math.min(LIMIAR_LA_NINA, ...valores) / PASSO_EIXO) * PASSO_EIXO;
  const yMax =
    Math.ceil(Math.max(LIMIAR_EL_NINO, ...valores) / PASSO_EIXO) * PASSO_EIXO;
  const passos = Math.round((yMax - yMin) / PASSO_EIXO);
  const ticks = Array.from({ length: passos + 1 }, (_, i) => yMin + i * PASSO_EIXO);

  const x = (indice: number) =>
    MARGEM.esquerda + ((indice + 0.5) * LARGURA_PLOT) / pontos.length;
  const y = (valor: number) =>
    MARGEM.topo + ALTURA_PLOT - ((valor - yMin) / (yMax - yMin)) * ALTURA_PLOT;

  const base = MARGEM.topo + ALTURA_PLOT;
  const fim = MARGEM.esquerda + LARGURA_PLOT;

  const ehPrevisto = (ponto: PontoRoni) => ponto.origem === "Previsto";

  const indicesObservados = pontos.reduce<number[]>((indices, ponto, indice) => {
    if (!ehPrevisto(ponto)) indices.push(indice);
    return indices;
  }, []);
  const indicesPrevistos = pontos.reduce<number[]>((indices, ponto, indice) => {
    if (ehPrevisto(ponto)) indices.push(indice);
    return indices;
  }, []);

  const caminho = (indices: number[]) =>
    indices
      .map((indice, posicao) => {
        const ponto = pontos[indice]!;
        return `${posicao === 0 ? "M" : "L"} ${x(indice)} ${y(ponto.roni)}`;
      })
      .join(" ");

  const ancora = indicesObservados[indicesObservados.length - 1];
  const indicesProjecao =
    ancora === undefined ? indicesPrevistos : [ancora, ...indicesPrevistos];

  const ultimoObservado = pontos[ancora ?? pontos.length - 1]!;
  const previstos = pontos.filter(ehPrevisto);

  return (
    <figure className="m-0 flex flex-col gap-4 rounded-2xl bg-soft p-4 xl:flex-row xl:items-start 2xl:flex-col">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="w-full">
          <svg
            viewBox={`0 0 ${LARGURA} ${ALTURA}`}
            className="mx-auto block h-auto w-full"
            role="img"
            aria-label={`RONI 3.4 de 2026 por temporada. Última observada: ${ultimoObservado.temporada}, ${formatarNumero(ultimoObservado.roni)} graus Celsius, fase ${ultimoObservado.fase}. Projeção SON–NDJ em linha tracejada, por regressão linear sobre os anos análogos.`}
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
  
          <line
            x1={MARGEM.esquerda}
            x2={fim}
            y1={y(LIMIAR_EL_NINO)}
            y2={y(LIMIAR_EL_NINO)}
            className="stroke-ink-secondary"
            strokeDasharray="6 4"
            strokeWidth={1.5}
          />
          <line
            x1={MARGEM.esquerda}
            x2={fim}
            y1={y(LIMIAR_LA_NINA)}
            y2={y(LIMIAR_LA_NINA)}
            className="stroke-ink-secondary"
            strokeDasharray="6 4"
            strokeWidth={1.5}
          />
          <line
            x1={MARGEM.esquerda}
            x2={fim}
            y1={y(0)}
            y2={y(0)}
            className="stroke-data-neutral/60"
            strokeDasharray="2 4"
            strokeWidth={1.5}
          />
  
          <text
            x={fim - 2}
            y={y(LIMIAR_EL_NINO) - 6}
            textAnchor="end"
            className="fill-ink-secondary text-[10px]"
          >
            +0,5 °C · El Niño
          </text>
          <text
            x={fim - 2}
            y={y(LIMIAR_LA_NINA) + 14}
            textAnchor="end"
            className="fill-ink-secondary text-[10px]"
          >
            −0,5 °C · La Niña
          </text>
  
          {ticks.map((tick) => (
            <text
              key={`eixo-y-${tick}`}
              x={MARGEM.esquerda - 10}
              y={y(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-data-neutral text-[11px]"
            >
              {formatarNumero(tick, 1)}
            </text>
          ))}
  
          <path
            d={caminho(indicesObservados)}
            className="fill-none stroke-deep"
            strokeWidth={2.5}
          />
          {indicesPrevistos.length > 0 && (
            <path
              d={caminho(indicesProjecao)}
              className="fill-none stroke-deep"
              strokeDasharray="5 4"
              strokeWidth={2.5}
            />
          )}
  
          {pontos.map((ponto, indice) => {
            const cor = corDaFase(ponto.fase);
            const previsto = ehPrevisto(ponto);
  
            return (
              <circle
                key={ponto.temporada}
                cx={x(indice)}
                cy={y(ponto.roni)}
                r={5}
                className={previsto ? `fill-soft ${cor.traco}` : `${cor.ponto} stroke-bg`}
                strokeWidth={2}
              >
                <title>
                  {`${ponto.temporada}: ${formatarNumero(ponto.roni)} °C (${ponto.fase ?? "—"})${previsto ? " · previsto" : ""}`}
                </title>
              </circle>
            );
          })}
  
          {pontos.map((ponto, indice) => (
            <text
              key={`rotulo-${ponto.temporada}`}
              x={x(indice)}
              y={y(ponto.roni) - 12}
              textAnchor="middle"
              className="fill-ink font-data text-[11px]"
            >
              {formatarNumero(ponto.roni)}
            </text>
          ))}
  
          {pontos.map((ponto, indice) => (
            <text
              key={`eixo-x-${ponto.temporada}`}
              x={x(indice)}
              y={base + 22}
              textAnchor="middle"
              className="fill-ink-secondary text-[12px]"
            >
              {ponto.temporada}
            </text>
          ))}
          </svg>
        </div>
  
        <div className="mx-auto flex w-full flex-wrap items-center gap-4 text-[14px] text-ink-secondary">
          {(["El Niño", "Neutro", "La Niña"] as const).map((fase) => (
            <span key={fase} className="flex items-center gap-1.5">
              <span className={`${CORES_FASE[fase].legenda} h-3 w-3 rounded-full`} />
              {fase}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className="h-0 w-5 border-t-2 border-deep" />
            observado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0 w-5 border-t-2 border-dashed border-deep" />
            previsto
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0 w-5 border-t border-dashed border-ink-secondary" />
            limiar ±0,5 °C
          </span>
        </div>

      </div>
      <figcaption className="flex min-w-0 flex-col gap-2 text-[14px] leading-[1.45] text-data-neutral xl:order-first xl:w-[360px] xl:shrink-0 2xl:order-none 2xl:w-auto">
        <p className="m-0">
          <span className="font-semibold text-ink-secondary">Projeção:</span> com os anos
          análogos como amostra, ajustou-se uma regressão linear para cada temporada futura —
          a reta aprende, nos análogos, como o RONI de ASO se relaciona com o que veio depois
          (SON, OND e NDJ). Aplicando o valor observado de {ultimoObservado.temporada} (
          {formatarNumero(ultimoObservado.roni)} °C) como entrada, ela estima os valores
          abaixo.
        </p>

        {previstos.length > 0 && (
          <table className="w-full border-collapse text-left text-[14px]">
            <caption className="sr-only">
              RONI previsto por temporada e variação em relação ao ASO observado
            </caption>
            <thead>
              <tr className="text-ink-secondary">
                <th
                  scope="col"
                  className="border-b border-data-neutral/30 py-1 pr-3 font-semibold"
                >
                  Temporada
                </th>
                <th
                  scope="col"
                  className="border-b border-data-neutral/30 py-1 pr-3 font-semibold"
                >
                  Previsto
                </th>
                <th scope="col" className="border-b border-data-neutral/30 py-1 font-semibold">
                  Δ vs ASO (°C)
                </th>
              </tr>
            </thead>
            <tbody>
              {previstos.map((ponto) => (
                <tr key={ponto.temporada}>
                  <th
                    scope="row"
                    className="border-b border-data-neutral/15 py-1 pr-3 text-left font-normal text-ink-secondary"
                  >
                    {ponto.temporada}
                  </th>
                  <td className="border-b border-data-neutral/15 py-1 pr-3 whitespace-nowrap">
                    {formatarNumero(ponto.roni)} °C
                  </td>
                  <td className="border-b border-data-neutral/15 py-1 whitespace-nowrap">
                    {sinalDoDelta(ponto.roni - ultimoObservado.roni)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="m-0">
          <span className="font-semibold text-ink-secondary">Δ vs ASO:</span> diferença, em
          °C, entre cada valor projetado e o último observado (
          {ultimoObservado.temporada}, {formatarNumero(ultimoObservado.roni)} °C) — positivo
          significa que o evento ganha intensidade.
        </p>
      </figcaption>
    </figure>
  );
}
