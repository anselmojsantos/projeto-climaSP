import { formatarComSinal, formatarDecimal, rotuloMes } from "../../../lib/formato";
import type { Mes2026 } from "../../model/types";

const LARGURA = 600;
const ALTURA = 330;
const MARGEM = { topo: 30, direita: 46, base: 44, esquerda: 46 };

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
  meses: Mes2026[];
}

export default function GraficoCaso2026({ meses }: Props) {
  if (meses.length === 0) {
    return null;
  }

  const mesesOrdenados = [...new Set(meses.map((mes) => mes.mesNum))].sort(
    (a, b) => a - b,
  );
  const porZona = new Map<string, Mes2026[]>();
  for (const mes of meses) {
    const serie = porZona.get(mes.zona) ?? [];
    serie.push(mes);
    porZona.set(mes.zona, serie);
  }

  const valoresChuva = meses
    .map((mes) => mes.anomaliaPct)
    .filter((valor): valor is number => valor !== null);
  const yMin = Math.floor(Math.min(0, ...valoresChuva) / 25) * 25;
  const yMax = Math.ceil(Math.max(1, ...valoresChuva) / 25) * 25;

  const x = (indice: number) =>
    MARGEM.esquerda +
    (mesesOrdenados.length === 1
      ? LARGURA_PLOT / 2
      : (indice / (mesesOrdenados.length - 1)) * LARGURA_PLOT);
  const y = (valor: number) =>
    MARGEM.topo + ALTURA_PLOT - ((valor - yMin) / (yMax - yMin)) * ALTURA_PLOT;

  const base = MARGEM.topo + ALTURA_PLOT;
  const direita = LARGURA - MARGEM.direita;

  const valoresNino = meses
    .map((mes) => mes.nino34)
    .filter((valor): valor is number => valor !== null);
  const ninoMin = Math.floor(Math.min(0, ...valoresNino) * 2) / 2;
  const ninoMax = Math.ceil(Math.max(1, ...valoresNino) * 2) / 2;
  const yNino = (valor: number) =>
    MARGEM.topo + ALTURA_PLOT - ((valor - ninoMin) / (ninoMax - ninoMin)) * ALTURA_PLOT;

  // NINO3.4 é o mesmo em todas as zonas: uma série por mês basta.
  const serieNino = mesesOrdenados.map((mesNum) =>
    meses.find((mes) => mes.mesNum === mesNum)?.nino34 ?? null,
  );
  const caminhoNino = serieNino
    .map((valor, indice) =>
      valor === null
        ? null
        : `${indice === 0 ? "M" : "L"} ${x(indice)} ${yNino(valor)}`,
    )
    .filter((parte): parte is string => parte !== null)
    .join(" ");

  const ticks: number[] = [];
  for (let valor = yMin; valor <= yMax; valor += 25) ticks.push(valor);

  return (
    <figure className="m-0 flex flex-col gap-3">
      <svg
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        className="mx-auto block h-auto w-full max-w-[880px]"
        role="img"
        aria-label="Anomalia mensal da chuva em 2026 por zona, comparada com a temperatura do Pacífico."
      >
        {ticks.map((tick) => (
          <g key={`grade-${tick}`}>
            <line
              x1={MARGEM.esquerda}
              x2={direita}
              y1={y(tick)}
              y2={y(tick)}
              className={tick === 0 ? "stroke-data-neutral/60" : "stroke-data-neutral/15"}
              strokeWidth={tick === 0 ? 1.5 : 1}
            />
            <text
              x={MARGEM.esquerda - 8}
              y={y(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-data-neutral text-[10px]"
            >
              {tick === 0 ? "0" : formatarComSinal(tick, 0)}
            </text>
          </g>
        ))}

        <text
          x={MARGEM.esquerda - 8}
          y={MARGEM.topo - 14}
          textAnchor="end"
          className="fill-ink-secondary text-[10px]"
        >
          %
        </text>
        <text
          x={direita + 8}
          y={MARGEM.topo - 14}
          className="fill-data-warm text-[10px]"
        >
          °C
        </text>

        {serieNino.map((valor, indice) =>
          valor === null ? null : (
            <text
              key={`nino-${indice}`}
              x={direita + 8}
              y={yNino(valor)}
              dominantBaseline="middle"
              className="fill-data-warm font-data text-[10px]"
            >
              {formatarDecimal(valor, 1)}
            </text>
          ),
        )}

        {caminhoNino && (
          <path
            d={caminhoNino}
            className="fill-none stroke-data-warm/70"
            strokeWidth={2}
            strokeDasharray="5 4"
          />
        )}

        {CORES.map(({ zona, traco }) => {
          const serie = porZona.get(zona);
          if (!serie) return null;

          const pontos = serie
            .slice()
            .sort((a, b) => a.mesNum - b.mesNum)
            .map((mes) =>
              mes.anomaliaPct === null
                ? null
                : {
                    valor: mes.anomaliaPct,
                    indice: mesesOrdenados.indexOf(mes.mesNum),
                    mesNum: mes.mesNum,
                    rotulo: formatarComSinal(mes.anomaliaPct, 0),
                  },
            )
            .filter(
              (ponto): ponto is { valor: number; indice: number; mesNum: number; rotulo: string } =>
                ponto !== null && ponto.indice >= 0,
            );

          const caminho = pontos
            .map(
              (ponto, indice) =>
                `${indice === 0 ? "M" : "L"} ${x(ponto.indice)} ${y(ponto.valor)}`,
            )
            .join(" ");

          return (
            <g key={zona}>
              <path d={caminho} className={`fill-none ${traco}`} strokeWidth={2.2} />
              {pontos.map((ponto) => (
                <circle
                  key={`${zona}-${ponto.mesNum}`}
                  cx={x(ponto.indice)}
                  cy={y(ponto.valor)}
                  r={3}
                  className={`${traco.replace("stroke-", "fill-")} stroke-bg`}
                  strokeWidth={1}
                >
                  <title>{`${zona} · ${rotuloMes(ponto.mesNum)}: ${ponto.rotulo}% da média`}</title>
                </circle>
              ))}
            </g>
          );
        })}

        {mesesOrdenados.map((mesNum, indice) => (
          <text
            key={`mes-${mesNum}`}
            x={x(indice)}
            y={base + 16}
            textAnchor="middle"
            className="fill-ink-secondary text-[10px]"
          >
            {rotuloMes(mesNum)}
          </text>
        ))}
      </svg>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-ink-secondary">
        {CORES.map(({ zona, legenda }) => (
          <span key={zona} className="flex items-center gap-1.5">
            <span className={`${legenda} h-0.5 w-5`} />
            {zona}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="h-0 w-5 border-t-2 border-dashed border-data-warm/70" />
          Niño 3.4 (eixo da direita)
        </span>
      </div>
    </figure>
  );
}
