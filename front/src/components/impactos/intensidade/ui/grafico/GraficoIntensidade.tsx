import { formatarDecimal } from "../../../lib/formato";
import type { ZonaIntensidade } from "../../model/types";

const LARGURA = 560;
const ALTURA = 300;
const MARGEM = { topo: 26, direita: 16, base: 44, esquerda: 42 };

const LARGURA_PLOT = LARGURA - MARGEM.esquerda - MARGEM.direita;
const ALTURA_PLOT = ALTURA - MARGEM.topo - MARGEM.base;

interface MetricaPlotada {
  chave: string;
  nome: string;
  cor: string;
  legenda: string;
}

const METRICAS: MetricaPlotada[] = [
  { chave: "chuva_mm", nome: "Chuva do mês", cor: "fill-deep", legenda: "bg-deep" },
  { chave: "max_dia_mm", nome: "Maior dia do mês", cor: "fill-accent", legenda: "bg-accent" },
  { chave: "p99_hora_mm", nome: "p99 da hora", cor: "fill-amber", legenda: "bg-amber" },
];

interface Props {
  zonas: ZonaIntensidade[];
}

export default function GraficoIntensidade({ zonas }: Props) {
  if (zonas.length === 0) {
    return (
      <p className="mt-5 mb-0 text-[14px] text-ink-secondary">
        Sem dados de intensidade para exibir.
      </p>
    );
  }

  const valores = zonas.flatMap((zona) =>
    METRICAS.map(
      (metrica) =>
        zona.metricas.find((item) => item.chave === metrica.chave)?.pct ?? null,
    ).filter((valor): valor is number => valor !== null),
  );

  const maior = Math.max(1, ...valores);
  const yMax = Math.ceil(maior / 2) * 2;

  const y = (valor: number) =>
    MARGEM.topo + ALTURA_PLOT - (valor / yMax) * ALTURA_PLOT;
  const base = MARGEM.topo + ALTURA_PLOT;

  const larguraGrupo = LARGURA_PLOT / zonas.length;
  const larguraBarra = Math.min(24, (larguraGrupo * 0.64) / METRICAS.length);

  const ticks: number[] = [];
  for (let valor = 0; valor <= yMax; valor += 2) ticks.push(valor);

  return (
    <figure className="m-0 flex flex-col gap-3">
      <svg
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        className="mx-auto block h-auto w-full"
        role="img"
        aria-label="Quanto a chuva cresce por grau Celsius de aquecimento do Pacífico, por zona e por medida."
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
              x={MARGEM.esquerda - 8}
              y={y(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-data-neutral text-[11px]"
            >
              {formatarDecimal(tick, 0)}%
            </text>
          </g>
        ))}

        {zonas.map((zona, indiceZona) => {
          const centro = MARGEM.esquerda + larguraGrupo * (indiceZona + 0.5);
          const larguraTotal = larguraBarra * METRICAS.length + 3 * (METRICAS.length - 1);
          const inicio = centro - larguraTotal / 2;

          return (
            <g key={zona.zona}>
              {METRICAS.map((metrica, indiceBarra) => {
                const item = zona.metricas.find((m) => m.chave === metrica.chave);
                if (!item || item.pct === null) return null;

                const x = inicio + indiceBarra * (larguraBarra + 3);
                const altura = y(0) - y(item.pct);

                return (
                  <g key={`${zona.zona}-${metrica.chave}`}>
                    <rect
                      x={x}
                      y={y(item.pct)}
                      width={larguraBarra}
                      height={Math.max(altura, 1)}
                      rx={2}
                      className={metrica.cor}
                    >
                      <title>{`${zona.zona} · ${metrica.nome}: ${formatarDecimal(item.pct)}% por °C`}</title>
                    </rect>
                    <text
                      x={x + larguraBarra / 2}
                      y={y(item.pct) - 4}
                      textAnchor="middle"
                      className="fill-ink font-data text-[9px]"
                    >
                      {formatarDecimal(item.pct, 1)}
                    </text>
                  </g>
                );
              })}

              <text
                x={centro}
                y={base + 18}
                textAnchor="middle"
                className="fill-ink-secondary text-[11px]"
              >
                {zona.zona}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap items-center gap-4 text-[13px] text-ink-secondary">
        {METRICAS.map((metrica) => (
          <span key={metrica.chave} className="flex items-center gap-1.5">
            <span className={`${metrica.legenda} h-3 w-3 rounded-sm`} />
            {metrica.nome}
          </span>
        ))}
      </div>
    </figure>
  );
}
