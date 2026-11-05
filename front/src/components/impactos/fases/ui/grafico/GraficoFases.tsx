import { formatarComSinal } from "../../../lib/formato";
import type { FaseResumo } from "../../model/types";

const LARGURA = 520;
const ALTURA = 270;
const MARGEM = { topo: 26, direita: 16, base: 54, esquerda: 44 };

const LARGURA_PLOT = LARGURA - MARGEM.esquerda - MARGEM.direita;
const ALTURA_PLOT = ALTURA - MARGEM.topo - MARGEM.base;

const CORES: Record<string, { barra: string; legenda: string }> = {
  "El Niño": { barra: "fill-data-warm", legenda: "bg-data-warm" },
  Neutro: { barra: "fill-data-neutral", legenda: "bg-data-neutral" },
  "La Niña": { barra: "fill-data-cold", legenda: "bg-data-cold" },
};

interface Props {
  fases: FaseResumo[];
}

export default function GraficoFases({ fases }: Props) {
  const valores = fases
    .map((fase) => fase.anomaliaPct)
    .filter((valor): valor is number => valor !== null);

  if (valores.length === 0) {
    return (
      <p className="mt-5 mb-0 text-[14px] text-ink-secondary">
        Sem dados de chuva por fase para exibir.
      </p>
    );
  }

  const menor = Math.min(0, ...valores);
  const maior = Math.max(10, ...valores);
  const yMin = Math.floor(menor / 5) * 5;
  const yMax = Math.ceil(maior / 5) * 5;

  const y = (valor: number) =>
    MARGEM.topo + ALTURA_PLOT - ((valor - yMin) / (yMax - yMin)) * ALTURA_PLOT;
  const base = MARGEM.topo + ALTURA_PLOT;

  const larguraGrupo = LARGURA_PLOT / fases.length;
  const larguraBarra = Math.min(64, larguraGrupo * 0.56);

  const ticks: number[] = [];
  for (let valor = yMin; valor <= yMax; valor += 5) ticks.push(valor);

  return (
    <figure className="m-0 flex flex-col gap-3">
      <svg
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        className="mx-auto block h-auto w-full max-w-[520px]"
        role="img"
        aria-label="Chuva média em meses de El Niño, neutros e de La Niña, em relação à normal do mesmo mês."
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
              {tick === 0 ? "0" : formatarComSinal(tick, 0)}
            </text>
          </g>
        ))}

        <text
          x={MARGEM.esquerda - 8}
          y={MARGEM.topo - 10}
          textAnchor="end"
          className="fill-ink-secondary text-[10px]"
        >
          %
        </text>

        {fases.map((fase, indice) => {
          const valor = fase.anomaliaPct;
          if (valor === null) return null;

          const centro = MARGEM.esquerda + larguraGrupo * (indice + 0.5);
          const x = centro - larguraBarra / 2;
          const topo = valor >= 0 ? y(valor) : y(0);
          const altura = Math.abs(y(valor) - y(0));
          const cor = CORES[fase.fase] ?? CORES.Neutro!;

          return (
            <g key={fase.fase}>
              <rect
                x={x}
                y={topo}
                width={larguraBarra}
                height={Math.max(altura, 1)}
                rx={3}
                className={cor.barra}
              >
                <title>{`${fase.fase}: ${formatarComSinal(valor, 0)}% em relação à normal, em ${fase.meses} meses`}</title>
              </rect>
              <text
                x={centro}
                y={valor >= 0 ? topo - 6 : topo + altura + 14}
                textAnchor="middle"
                className="fill-ink font-data text-[12px]"
              >
                {valor === 0 ? "0%" : `${formatarComSinal(valor, 0)}%`}
              </text>
              <text
                x={centro}
                y={base + 20}
                textAnchor="middle"
                className="fill-ink-secondary text-[12px]"
              >
                {fase.fase}
              </text>
            </g>
          );
        })}
      </svg>

      <figcaption className="text-[13px] leading-[1.4] text-ink-secondary">
        Cada barra é a média dos meses daquela fase, comparada com a normal do
        mesmo mês. A linha horizontal marca a normal.
      </figcaption>
    </figure>
  );
}
