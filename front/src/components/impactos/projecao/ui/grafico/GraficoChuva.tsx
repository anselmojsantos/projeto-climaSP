import { formatarComSinal } from "../../../lib/formato";
import type { MesProjecao, ZonaProjecao } from "../../model/types";

const LARGURA = 600;
const ALTURA = 300;
const MARGEM = { topo: 26, direita: 16, base: 44, esquerda: 40 };

const LARGURA_PLOT = LARGURA - MARGEM.esquerda - MARGEM.direita;
const ALTURA_PLOT = ALTURA - MARGEM.topo - MARGEM.base;

const CORES: { zona: string; traco: string; legenda: string }[] = [
  { zona: "Centro", traco: "stroke-deep", legenda: "bg-deep" },
  { zona: "Leste", traco: "stroke-accent", legenda: "bg-accent" },
  { zona: "Norte", traco: "stroke-data-warm", legenda: "bg-data-warm" },
  { zona: "Oeste", traco: "stroke-data-cold", legenda: "bg-data-cold" },
  { zona: "Sul", traco: "stroke-amber", legenda: "bg-amber" },
];

interface Props {
  meses: MesProjecao[];
  zonas: ZonaProjecao[];
}

export default function GraficoChuva({ meses, zonas }: Props) {
  if (meses.length === 0) {
    return null;
  }

  const valores = zonas
    .map((zona) => zona.desvioPct)
    .filter((valor): valor is number => valor !== null);

  if (valores.length === 0) {
    return (
      <p className="mt-5 mb-0 text-[14px] text-ink-secondary">
        Sem projeção de chuva para exibir.
      </p>
    );
  }

  const yMin = Math.min(0, Math.floor((Math.min(...valores) - 1) / 2) * 2);
  const yMax = Math.max(2, Math.ceil((Math.max(...valores) + 1) / 2) * 2);

  const x = (indice: number) =>
    MARGEM.esquerda +
    (meses.length <= 1
      ? LARGURA_PLOT / 2
      : (indice / (meses.length - 1)) * LARGURA_PLOT);
  const y = (valor: number) =>
    MARGEM.topo + ALTURA_PLOT - ((valor - yMin) / (yMax - yMin)) * ALTURA_PLOT;
  const base = MARGEM.topo + ALTURA_PLOT;

  const ticks: number[] = [];
  for (let valor = yMin; valor <= yMax; valor += 2) ticks.push(valor);

  return (
    <figure className="m-0 flex flex-col gap-2 rounded-2xl bg-soft p-3">
      <figcaption className="text-[13px] font-semibold text-ink">
        Chuva projetada
      </figcaption>

      <svg
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        className="mx-auto block h-auto w-full"
        role="img"
        aria-label="Desvio projetado da chuva em relação à normal, por zona, de outubro de 2026 a fevereiro de 2027."
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
              {tick === 0 ? "0" : `${formatarComSinal(tick, 0)}%`}
            </text>
          </g>
        ))}

        <text
          x={MARGEM.esquerda - 6}
          y={MARGEM.topo - 10}
          textAnchor="end"
          className="fill-ink-secondary text-[10px]"
        >
          %
        </text>

        {CORES.map(({ zona, traco }) => {
          const serie = meses
            .map((mes) => zonas.find((item) => item.zona === zona && item.mes === mes.mes))
            .map((item) => item?.desvioPct ?? null);

          const caminho = serie
            .map((valor, indice) =>
              valor === null
                ? null
                : `${indice === 0 ? "M" : "L"} ${x(indice)} ${y(valor)}`,
            )
            .filter((parte): parte is string => parte !== null)
            .join(" ");

          if (!caminho) return null;

          return (
            <g key={zona}>
              <path d={caminho} className={`fill-none ${traco}`} strokeWidth={2.2} />
              {serie.map((valor, indice) =>
                valor === null ? null : (
                  <circle
                    key={`${zona}-${meses[indice]?.mes ?? indice}`}
                    cx={x(indice)}
                    cy={y(valor)}
                    r={3}
                    className={`${traco.replace("stroke-", "fill-")} stroke-bg`}
                    strokeWidth={1}
                  >
                    <title>{`${zona} · ${meses[indice]?.rotulo ?? ""}: ${formatarComSinal(valor, 1)}%`}</title>
                  </circle>
                ),
              )}
            </g>
          );
        })}

        {meses.map((mes, indice) => (
          <text
            key={`mes-${mes.mes}`}
            x={x(indice)}
            y={base + 18}
            textAnchor="middle"
            className="fill-ink-secondary text-[10px]"
          >
            {mes.rotulo}
          </text>
        ))}
      </svg>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-ink-secondary">
        {CORES.map(({ zona, legenda }) => (
          <span key={zona} className="flex items-center gap-1.5">
            <span className={`${legenda} h-0.5 w-4`} />
            {zona}
          </span>
        ))}
      </div>
    </figure>
  );
}
