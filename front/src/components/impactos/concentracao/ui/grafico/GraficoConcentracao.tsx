import { formatarComSinal, formatarDecimal } from "../../../lib/formato";
import type { ZonaConcentracao } from "../../model/types";

const LARGURA = 560;
const ALTURA = 260;
const MARGEM = { topo: 24, direita: 120, base: 40, esquerda: 62 };

const LARGURA_PLOT = LARGURA - MARGEM.esquerda - MARGEM.direita;

interface Props {
  zonas: ZonaConcentracao[];
}

export default function GraficoConcentracao({ zonas }: Props) {
  const validas = zonas.filter(
    (zona) => zona.deltaPP !== null && zona.icInf !== null && zona.icSup !== null,
  );

  if (validas.length === 0) {
    return (
      <p className="mt-5 mb-0 text-[14px] text-ink-secondary">
        Sem dados de concentração para exibir.
      </p>
    );
  }

  const minimo = Math.min(0, ...validas.map((z) => z.icInf!));
  const maximo = Math.max(0, ...validas.map((z) => z.icSup!));
  const xMin = Math.floor(minimo) - 1;
  const xMax = Math.ceil(maximo) + 1;

  const x = (valor: number) =>
    MARGEM.esquerda + ((valor - xMin) / (xMax - xMin)) * LARGURA_PLOT;

  const alturaLinha = (ALTURA - MARGEM.topo - MARGEM.base) / validas.length;
  const y = (indice: number) => MARGEM.topo + alturaLinha * (indice + 0.5);

  const ticks: number[] = [];
  for (let valor = Math.ceil(xMin / 2) * 2; valor <= xMax; valor += 2) {
    ticks.push(valor);
  }

  return (
    <figure className="m-0 flex flex-col gap-3">
      <svg
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        className="mx-auto block h-auto w-full max-w-[760px]"
        role="img"
        aria-label="Diferença entre o crescimento do maior dia e o crescimento do total, com margem de erro de 95%."
      >
        {ticks.map((tick) => (
          <g key={`grade-${tick}`}>
            <line
              x1={x(tick)}
              x2={x(tick)}
              y1={MARGEM.topo}
              y2={ALTURA - MARGEM.base}
              className={tick === 0 ? "stroke-data-neutral/60" : "stroke-data-neutral/15"}
              strokeWidth={tick === 0 ? 1.5 : 1}
            />
            <text
              x={x(tick)}
              y={ALTURA - MARGEM.base + 16}
              textAnchor="middle"
              className="fill-data-neutral text-[11px]"
            >
              {tick === 0 ? "0" : formatarComSinal(tick, 0)}
            </text>
          </g>
        ))}

        <text
          x={MARGEM.esquerda}
          y={ALTURA - 4}
          className="fill-ink-secondary text-[10px]"
        >
          pontos percentuais por °C
        </text>

        {validas.map((zona, indice) => {
          const centro = y(indice);
          const delta = zona.deltaPP!;
          const inf = zona.icInf!;
          const sup = zona.icSup!;
          const positivo = delta >= 0;

          return (
            <g key={zona.zona}>
              <text
                x={MARGEM.esquerda - 8}
                y={centro}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-ink-secondary text-[11px]"
              >
                {zona.zona}
              </text>

              <line
                x1={x(inf)}
                x2={x(sup)}
                y1={centro}
                y2={centro}
                className="stroke-data-neutral"
                strokeWidth={1.5}
              />
              <line
                x1={x(inf)}
                x2={x(inf)}
                y1={centro - 5}
                y2={centro + 5}
                className="stroke-data-neutral"
                strokeWidth={1.5}
              />
              <line
                x1={x(sup)}
                x2={x(sup)}
                y1={centro - 5}
                y2={centro + 5}
                className="stroke-data-neutral"
                strokeWidth={1.5}
              />

              <rect
                x={positivo ? x(0) : x(delta)}
                y={centro - 6}
                width={Math.max(Math.abs(x(delta) - x(0)), 1)}
                height={12}
                rx={2}
                className={positivo ? "fill-accent" : "fill-data-cold"}
              />

              <circle
                cx={x(delta)}
                cy={centro}
                r={3.5}
                className="fill-deep stroke-bg"
                strokeWidth={1.5}
              />

              <text
                x={LARGURA - MARGEM.direita + 6}
                y={centro - 3}
                className="fill-ink font-data text-[10px]"
              >
                {formatarComSinal(delta)} p.p.
              </text>
              <text
                x={LARGURA - MARGEM.direita + 6}
                y={centro + 10}
                className="fill-ink-secondary font-data text-[9px]"
              >
                {`IC ${formatarDecimal(inf)} a ${formatarComSinal(sup)}`}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap items-center gap-4 text-[13px] text-ink-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-accent" />
          maior dia cresce mais que o total
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-5 bg-data-neutral" />
          margem de erro (95%)
        </span>
        <span className="text-data-neutral">se a linha cruza o zero, não dá para afirmar</span>
      </div>
    </figure>
  );
}
