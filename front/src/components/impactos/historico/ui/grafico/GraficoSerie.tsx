import { formatarComSinal, formatarDecimal } from "../../../lib/formato";
import type { PeriodoElNino, PontoSerie } from "../../model/types";

const LARGURA = 980;
const ALTURA = 380;
const MARGEM = { topo: 28, direita: 58, base: 42, esquerda: 46 };

const LARGURA_PLOT = LARGURA - MARGEM.esquerda - MARGEM.direita;
const ALTURA_PLOT = ALTURA - MARGEM.topo - MARGEM.base;

const ANOS_EIXO = [1961, 1970, 1980, 1990, 2000, 2010, 2020];
const DESTAQUES = new Set(["1982–1983", "1997–1998", "2015–2016"]);

interface Props {
  pontos: PontoSerie[];
  periodos: PeriodoElNino[];
}

function caminho(
  valores: (number | null)[],
  px: (indice: number) => number,
  py: (valor: number) => number,
): string {
  const partes: string[] = [];
  let abrir = true;
  valores.forEach((valor, indice) => {
    if (valor === null) {
      abrir = true;
      return;
    }
    partes.push(`${abrir ? "M" : "L"} ${px(indice)} ${py(valor)}`);
    abrir = false;
  });
  return partes.join(" ");
}

function indicesDoPeriodo(
  pontos: PontoSerie[],
  periodo: PeriodoElNino,
): { inicio: number; fim: number } | null {
  let inicio: number | null = null;
  let fim: number | null = null;
  for (let indice = 0; indice < pontos.length; indice += 1) {
    const mes = pontos[indice]?.mes;
    if (!mes) continue;
    if (mes >= periodo.inicio && mes <= periodo.fim) {
      if (inicio === null) inicio = indice;
      fim = indice;
    }
  }
  return inicio === null || fim === null ? null : { inicio, fim };
}

function eixoNino(valor: number): string {
  if (valor === 0) return "0";
  return valor < 0
    ? `−${formatarDecimal(Math.abs(valor), 1)}`
    : formatarDecimal(valor, 1);
}

export default function GraficoSerie({ pontos, periodos }: Props) {
  if (pontos.length === 0) {
    return (
      <p className="mt-5 mb-0 text-[14px] text-ink-secondary">
        Sem série de chuva para exibir.
      </p>
    );
  }

  const chuvas = pontos
    .map((ponto) => ponto.chuva)
    .filter((valor): valor is number => valor !== null);
  const ninos = pontos
    .map((ponto) => ponto.nino)
    .filter((valor): valor is number => valor !== null);

  const yMin = Math.floor(Math.min(-20, ...chuvas) / 10) * 10;
  const yMax = Math.ceil(Math.max(30, ...chuvas) / 10) * 10;
  const ninoMin = Math.floor(Math.min(-2, ...ninos) * 2) / 2;
  const ninoMax = Math.ceil(Math.max(2.5, ...ninos) * 2) / 2;

  const x = (indice: number) =>
    MARGEM.esquerda +
    (pontos.length <= 1
      ? LARGURA_PLOT / 2
      : (indice / (pontos.length - 1)) * LARGURA_PLOT);
  const yChuva = (valor: number) =>
    MARGEM.topo + ALTURA_PLOT - ((valor - yMin) / (yMax - yMin)) * ALTURA_PLOT;
  const yNino = (valor: number) =>
    MARGEM.topo +
    ALTURA_PLOT -
    ((valor - ninoMin) / (ninoMax - ninoMin)) * ALTURA_PLOT;
  const base = MARGEM.topo + ALTURA_PLOT;

  const ticksChuva: number[] = [];
  for (let valor = yMin; valor <= yMax; valor += 10) ticksChuva.push(valor);

  const ticksNino: number[] = [];
  for (let indice = 0; indice <= (ninoMax - ninoMin) / 0.5; indice += 1) {
    ticksNino.push(Number((ninoMin + indice * 0.5).toFixed(1)));
  }

  const faixas = periodos
    .map((periodo) => {
      const indices = indicesDoPeriodo(pontos, periodo);
      return indices ? { periodo, ...indices } : null;
    })
    .filter(
      (
        faixa,
      ): faixa is { periodo: PeriodoElNino; inicio: number; fim: number } =>
        faixa !== null,
    );

  return (    <figure className="m-0 flex flex-col gap-3">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${LARGURA} ${ALTURA}`}
          className="block h-auto w-full min-w-[760px]"
          role="img"
          aria-label="Chuva e temperatura do Pacífico, em médias móveis de 12 meses, de 1961 a 2026, com os períodos de El Niño destacados."
        >
          {faixas.map((faixa) => (
            <rect
              key={`faixa-${faixa.periodo.inicio}`}
              x={x(faixa.inicio)}
              y={MARGEM.topo}
              width={Math.max(x(faixa.fim) - x(faixa.inicio), 1)}
              height={ALTURA_PLOT}
              className="fill-data-warm/10"
            >
              <title>
                {`El Niño: ${faixa.periodo.rotulo} (pico de ${formatarDecimal(faixa.periodo.pico, 2)} °C na média de 12 meses)`}
              </title>
            </rect>
          ))}

          {ticksChuva.map((tick) => (
            <g key={`chuva-${tick}`}>
              <line
                x1={MARGEM.esquerda}
                x2={LARGURA - MARGEM.direita}
                y1={yChuva(tick)}
                y2={yChuva(tick)}
                className={
                  tick === 0 ? "stroke-data-neutral/60" : "stroke-data-neutral/15"
                }
                strokeWidth={tick === 0 ? 1.5 : 1}
              />
              <text
                x={MARGEM.esquerda - 8}
                y={yChuva(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-data-neutral text-[10px]"
              >
                {tick === 0 ? "0" : `${formatarComSinal(tick, 0)}%`}
              </text>
            </g>
          ))}

          <text
            x={MARGEM.esquerda - 8}
            y={MARGEM.topo - 10}
            textAnchor="end"
            className="fill-ink-secondary text-[10px]"
          >
            chuva
          </text>

          {ticksNino.map((tick) => (
            <text
              key={`nino-${tick}`}
              x={LARGURA - MARGEM.direita + 8}
              y={yNino(tick)}
              dominantBaseline="middle"
              className="fill-data-warm text-[10px]"
            >
              {eixoNino(tick)}
            </text>
          ))}

          <text
            x={LARGURA - MARGEM.direita + 8}
            y={MARGEM.topo - 10}
            className="fill-data-warm text-[10px]"
          >
            °C
          </text>

          {faixas
            .filter((faixa) => DESTAQUES.has(faixa.periodo.rotulo))
            .map((faixa) => {
              const centro = (x(faixa.inicio) + x(faixa.fim)) / 2;
              return (
                <path
                  key={`destaque-${faixa.periodo.inicio}`}
                  d={`M ${centro - 4} ${MARGEM.topo - 11} L ${centro + 4} ${MARGEM.topo - 11} L ${centro} ${MARGEM.topo - 3} Z`}
                  className="fill-data-warm"
                >
                  <title>{`El Niño forte: ${faixa.periodo.rotulo}`}</title>
                </path>
              );
            })}

          <path
            d={caminho(
              pontos.map((ponto) => ponto.chuva),
              x,
              yChuva,
            )}
            className="fill-none stroke-deep"
            strokeWidth={2}
          />
          <path
            d={caminho(
              pontos.map((ponto) => ponto.nino),
              x,
              yNino,
            )}
            className="fill-none stroke-data-warm"
            strokeWidth={2}
            strokeDasharray="6 4"
          />

          {ANOS_EIXO.map((ano) => {
            const indice = pontos.findIndex((ponto) =>
              ponto.mes.startsWith(String(ano)),
            );
            if (indice < 0) return null;
            return (
              <text
                key={`ano-${ano}`}
                x={x(indice)}
                y={base + 18}
                textAnchor="middle"
                className="fill-ink-secondary text-[10px]"
              >
                {ano}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-ink-secondary">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-5 bg-deep" />
          chuva (% acima ou abaixo da normal)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0 w-5 border-t-2 border-dashed border-data-warm" />
          Pacífico (°C acima ou abaixo do normal)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-data-warm/20" />
          El Niño
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block text-[11px] text-data-warm">▲</span>
          os três mais fortes
        </span>
      </div>

      <figcaption className="text-[13px] leading-[1.4] text-ink-secondary">
        Cada ponto é a média dos 12 meses anteriores. As faixas vermelhas marcam
        os 15 períodos em que a média de 12 meses do Pacífico ficou em +0,5 °C
        ou mais. Os triângulos indicam 1982–83, 1997–98 e 2015–16.
      </figcaption>
    </figure>
  );
}
