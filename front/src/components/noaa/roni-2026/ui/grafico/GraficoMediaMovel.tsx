import {
  CORES_FASE,
  FASE_NEUTRA,
  LIMIAR_EL_NINO,
  LIMIAR_LA_NINA,
  PASSO_EIXO,
} from "../../../model/limiares";
import { formatarNumero } from "../../../lib/formato";
import { formatoIntervalo, listaTemporadas, rotuloEixo } from "../../model/rotulos";
import type { PontoRoni } from "../../model/types";

const LARGURA = 520;
const ALTURA = 340;
const MARGEM = { topo: 26, direita: 20, base: 64, esquerda: 48 };

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

  // O ano base é o do último observado: a partir dele o rótulo do eixo ganha
  // o sufixo do ano, porque JFM e DJF se repetem entre 2026 e 2027.
  const anoBase = ultimoObservado.ano;
  const rotuloDe = (ponto: PontoRoni) => rotuloEixo(ponto, anoBase);
  const chaveDe = (ponto: PontoRoni) => `${ponto.ano ?? "s"}-${ponto.temporada}`;
  const intervaloProjecao = formatoIntervalo(previstos);
  const listaProjecao = listaTemporadas(previstos);
  const tamanhoRotuloX = pontos.length > 10 ? 10 : 12;
  // Agrupa os pontos por ano para desenhar a faixa de ano sob o eixo, no lugar
  // de sufixar cada rótulo ("DJF/27"), que fica poluído e colide no fim.
  const gruposAno = pontos.reduce<{ ano: number; inicio: number; fim: number }[]>(
    (grupos, ponto, indice) => {
      if (ponto.ano === null) return grupos;
      const ultimo = grupos[grupos.length - 1];
      if (ultimo && ultimo.ano === ponto.ano) ultimo.fim = indice;
      else grupos.push({ ano: ponto.ano, inicio: indice, fim: indice });
      return grupos;
    },
    [],
  );

  const descricaoProjecao =
    previstos.length > 0
      ? ` Projeção ${intervaloProjecao} em linha tracejada, por regressão linear sobre os anos análogos.`
      : "";

  return (
    <figure className="m-0 flex flex-col gap-4 rounded-2xl bg-soft p-4 xl:flex-row xl:items-start 2xl:flex-col">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="w-full">
          <svg
            viewBox={`0 0 ${LARGURA} ${ALTURA}`}
            className="mx-auto block h-auto w-full"
            role="img"
            aria-label={`RONI 3.4 por temporada. Última observada: ${ultimoObservado.temporada}, ${formatarNumero(ultimoObservado.roni)} graus Celsius, fase ${ultimoObservado.fase}.${descricaoProjecao}`}
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
                key={chaveDe(ponto)}
                cx={x(indice)}
                cy={y(ponto.roni)}
                r={5}
                className={previsto ? `fill-soft ${cor.traco}` : `${cor.ponto} stroke-bg`}
                strokeWidth={2}
              >
                <title>
                  {`${rotuloDe(ponto)}: ${formatarNumero(ponto.roni)} °C (${ponto.fase ?? "—"})${previsto ? " · previsto" : ""}`}
                </title>
              </circle>
            );
          })}
  
          {pontos.map((ponto, indice) => {
            // Perto de zero a reta passa em cima do valor; o rótulo vai para a
            // direita do ponto para não encostar no rótulo da temporada anterior.
            const pertoDeZero = Math.abs(ponto.roni) < 0.15;
            const xRotulo = x(indice) + (pertoDeZero ? 18 : 0);
            const yRotulo = y(ponto.roni) + (pertoDeZero ? 4 : -12);

            return (
              <g key={`rotulos-${chaveDe(ponto)}`}>
                <text
                  x={xRotulo}
                  y={yRotulo}
                  textAnchor={pertoDeZero ? "start" : "middle"}
                  className="fill-ink stroke-bg font-data text-[11px]"
                  strokeWidth={3}
                  style={{ paintOrder: "stroke" }}
                >
                  {formatarNumero(ponto.roni)}
                </text>
                <text
                  x={x(indice)}
                  y={base + 16}
                  textAnchor="middle"
                  className="fill-ink-secondary"
                  style={{ fontSize: tamanhoRotuloX }}
                >
                  {ponto.temporada}
                </text>
              </g>
            );
          })}

          {gruposAno.length > 1 &&
            gruposAno.map((grupo) => {
              const inicio = x(grupo.inicio) - 14;
              const fimGrupo = x(grupo.fim) + 14;

              return (
                <g key={`ano-${grupo.ano}`}>
                  <line
                    x1={inicio}
                    x2={fimGrupo}
                    y1={base + 32}
                    y2={base + 32}
                    className="stroke-data-neutral/40"
                    strokeWidth={1}
                  />
                  <text
                    x={(inicio + fimGrupo) / 2}
                    y={base + 46}
                    textAnchor="middle"
                    className="fill-ink-secondary text-[10px]"
                  >
                    {grupo.ano}
                  </text>
                  {grupo !== gruposAno[0] && (
                    <line
                      x1={inicio - 8}
                      x2={inicio - 8}
                      y1={base + 26}
                      y2={base + 40}
                      className="stroke-data-neutral/40"
                      strokeWidth={1}
                    />
                  )}
                </g>
              );
            })}
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
          <span className="font-semibold text-ink-secondary">Projeção:</span> para cada
          temporada futura foi ajustada uma regressão linear sobre os anos análogos — cada
          ano entra como um ponto, com o RONI de ASO no eixo horizontal e o da temporada no
          vertical. A reta treinada descreve como o evento costuma evoluir de ASO até
          aquele horizonte ({listaProjecao}); aplicando o valor observado em{" "}
          {ultimoObservado.temporada} ({formatarNumero(ultimoObservado.roni)} °C) como
          entrada, ela gera os valores abaixo. A projeção cobre {intervaloProjecao}.
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
                <tr key={chaveDe(ponto)}>
                  <th
                    scope="row"
                    className="border-b border-data-neutral/15 py-1 pr-3 text-left font-normal text-ink-secondary"
                  >
                    {rotuloDe(ponto)}
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
