import { formatarDecimal } from "../../../lib/formato";
import type { MesProjecao } from "../../model/types";

const LARGURA = 420;
const ALTURA = 280;
const MARGEM = { topo: 24, direita: 16, base: 44, esquerda: 38 };

const LARGURA_PLOT = LARGURA - MARGEM.esquerda - MARGEM.direita;
const ALTURA_PLOT = ALTURA - MARGEM.topo - MARGEM.base;

interface Props {
  meses: MesProjecao[];
}

export default function GraficoNino({ meses }: Props) {
  if (meses.length === 0) {
    return null;
  }

  const valores = meses.map((mes) => mes.nino34);
  const yMin = Math.floor((Math.min(...valores) - 0.2) * 2) / 2;
  const yMax = Math.ceil((Math.max(...valores) + 0.2) * 2) / 2;

  const x = (indice: number) =>
    MARGEM.esquerda +
    (meses.length <= 1
      ? LARGURA_PLOT / 2
      : (indice / (meses.length - 1)) * LARGURA_PLOT);
  const y = (valor: number) =>
    MARGEM.topo + ALTURA_PLOT - ((valor - yMin) / (yMax - yMin)) * ALTURA_PLOT;
  const base = MARGEM.topo + ALTURA_PLOT;

  const caminho = meses
    .map(
      (mes, indice) =>
        `${indice === 0 ? "M" : "L"} ${x(indice)} ${y(mes.nino34)}`,
    )
    .join(" ");

  const ticks: number[] = [];
  for (let indice = 0; indice <= (yMax - yMin) / 0.5; indice += 1) {
    ticks.push(Number((yMin + indice * 0.5).toFixed(1)));
  }

  return (
    <figure className="m-0 flex flex-col gap-2 rounded-2xl bg-soft p-3">
      <figcaption className="text-[13px] font-semibold text-ink">
        Pacífico projetado
      </figcaption>

      <svg
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        className="mx-auto block h-auto w-full max-w-[460px]"
        role="img"
        aria-label="Temperatura do Pacífico projetada para outubro de 2026 a fevereiro de 2027."
      >
        {ticks.map((tick) => (
          <g key={`grade-${tick}`}>
            <line
              x1={MARGEM.esquerda}
              x2={LARGURA - MARGEM.direita}
              y1={y(tick)}
              y2={y(tick)}
              className="stroke-data-neutral/20"
              strokeWidth={1}
            />
            <text
              x={MARGEM.esquerda - 6}
              y={y(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-data-neutral text-[10px]"
            >
              {formatarDecimal(tick, 1)}
            </text>
          </g>
        ))}

        <text
          x={MARGEM.esquerda - 6}
          y={MARGEM.topo - 10}
          textAnchor="end"
          className="fill-ink-secondary text-[10px]"
        >
          °C
        </text>

        <path d={caminho} className="fill-none stroke-data-warm" strokeWidth={2.4} />

        {meses.map((mes, indice) => (
          <g key={mes.mes}>
            <circle
              cx={x(indice)}
              cy={y(mes.nino34)}
              r={4}
              className="fill-data-warm stroke-bg"
              strokeWidth={1.5}
            >
              <title>{`${mes.rotulo}: ${formatarDecimal(mes.nino34, 2)} °C`}</title>
            </circle>
            <text
              x={x(indice)}
              y={y(mes.nino34) - 10}
              textAnchor="middle"
              className="fill-ink font-data text-[10px]"
            >
              {formatarDecimal(mes.nino34, 1)}
            </text>
            <text
              x={x(indice)}
              y={base + 18}
              textAnchor="middle"
              className="fill-ink-secondary text-[10px]"
            >
              {mes.rotulo}
            </text>
          </g>
        ))}
      </svg>

      <p className="m-0 text-[12px] leading-[1.4] text-ink-secondary">
        Acima de +0,5 °C, o Pacífico está em condição de El Niño.
      </p>
    </figure>
  );
}
