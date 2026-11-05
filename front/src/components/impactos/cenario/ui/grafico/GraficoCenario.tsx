import { formatarDecimal } from "../../../lib/formato";
import type { ZonaCenario } from "../../model/types";

const LARGURA = 400;
const ALTURA = 250;
const MARGEM = { topo: 30, direita: 12, base: 40, esquerda: 40 };

const LARGURA_PLOT = LARGURA - MARGEM.esquerda - MARGEM.direita;
const ALTURA_PLOT = ALTURA - MARGEM.topo - MARGEM.base;

interface Props {
  zonas: ZonaCenario[];
  rotulo: string;
  nino34: number | null;
}

export default function GraficoCenario({ zonas, rotulo, nino34 }: Props) {
  if (zonas.length === 0) {
    return null;
  }

  const valores = zonas.flatMap((zona) =>
    [zona.chuvaNormalMm, zona.chuvaEsperadaMm].filter(
      (valor): valor is number => valor !== null,
    ),
  );
  const yMax = Math.ceil(Math.max(1, ...valores) / 50) * 50;

  const y = (valor: number) =>
    MARGEM.topo + ALTURA_PLOT - (valor / yMax) * ALTURA_PLOT;
  const base = MARGEM.topo + ALTURA_PLOT;

  const larguraGrupo = LARGURA_PLOT / zonas.length;
  const larguraBarra = Math.min(22, larguraGrupo * 0.32);

  const ticks: number[] = [];
  for (let valor = 0; valor <= yMax; valor += 50) ticks.push(valor);

  return (
    <figure className="m-0 flex flex-col gap-2 rounded-2xl bg-soft p-3">
      <figcaption className="flex items-baseline justify-between gap-2 text-[13px]">
        <span className="font-semibold text-ink">{rotulo}</span>
        <span className="font-data text-ink-secondary">
          Niño 3.4 {nino34 === null ? "—" : `${formatarDecimal(nino34, 1)} °C`}
        </span>
      </figcaption>

      <svg
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        className="mx-auto block h-auto w-full max-w-[520px]"
        role="img"
        aria-label={`Chuva normal e esperada em ${rotulo}, por zona de São Paulo.`}
      >
        {ticks.map((tick) => (
          <g key={`grade-${tick}`}>
            <line
              x1={MARGEM.esquerda}
              x2={LARGURA - MARGEM.direita}
              y1={y(tick)}
              y2={y(tick)}
              className={tick === 0 ? "stroke-data-neutral/60" : "stroke-data-neutral/20"}
              strokeWidth={tick === 0 ? 1.5 : 1}
            />
            <text
              x={MARGEM.esquerda - 6}
              y={y(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-data-neutral text-[10px]"
            >
              {formatarDecimal(tick, 0)}
            </text>
          </g>
        ))}

        <text
          x={MARGEM.esquerda - 6}
          y={MARGEM.topo - 14}
          textAnchor="end"
          className="fill-ink-secondary text-[10px]"
        >
          mm
        </text>

        {zonas.map((zona, indice) => {
          const centro = MARGEM.esquerda + larguraGrupo * (indice + 0.5);
          const normal = zona.chuvaNormalMm;
          const esperada = zona.chuvaEsperadaMm;
          const xNormal = centro - larguraBarra - 2;
          const xEsperada = centro + 2;

          return (
            <g key={zona.zona}>
              {normal !== null && (
                <g>
                  <rect
                    x={xNormal}
                    y={y(normal)}
                    width={larguraBarra}
                    height={Math.max(y(0) - y(normal), 1)}
                    rx={2}
                    className="fill-data-neutral/50"
                  >
                    <title>{`${zona.zona} · normal: ${formatarDecimal(normal)} mm`}</title>
                  </rect>
                  <text
                    x={xNormal + larguraBarra / 2}
                    y={y(normal) - 4}
                    textAnchor="middle"
                    className="fill-ink-secondary font-data text-[9px]"
                  >
                    {formatarDecimal(normal, 0)}
                  </text>
                </g>
              )}

              {esperada !== null && (
                <g>
                  <rect
                    x={xEsperada}
                    y={y(esperada)}
                    width={larguraBarra}
                    height={Math.max(y(0) - y(esperada), 1)}
                    rx={2}
                    className="fill-deep"
                  >
                    <title>{`${zona.zona} · esperado: ${formatarDecimal(esperada)} mm`}</title>
                  </rect>
                  <text
                    x={xEsperada + larguraBarra / 2}
                    y={y(esperada) - 4}
                    textAnchor="middle"
                    className="fill-deep font-data text-[9px]"
                  >
                    {formatarDecimal(esperada, 0)}
                  </text>
                </g>
              )}

              <text
                x={centro}
                y={base + 16}
                textAnchor="middle"
                className="fill-ink-secondary text-[10px]"
              >
                {zona.zona}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap items-center gap-3 text-[12px] text-ink-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-data-neutral/50" />
          normal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-deep" />
          esperado
        </span>
      </div>
    </figure>
  );
}
