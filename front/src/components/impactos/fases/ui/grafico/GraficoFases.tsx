import { formatarComSinal } from "../../../lib/formato";
import type { ZonaFases } from "../../model/types";

const LARGURA = 560;
const ALTURA = 300;
const MARGEM = { topo: 26, direita: 16, base: 44, esquerda: 46 };

const LARGURA_PLOT = LARGURA - MARGEM.esquerda - MARGEM.direita;
const ALTURA_PLOT = ALTURA - MARGEM.topo - MARGEM.base;

const CORES: Record<string, { barra: string; legenda: string }> = {
  "El Niño": { barra: "fill-data-warm", legenda: "bg-data-warm" },
  Neutro: { barra: "fill-data-neutral", legenda: "bg-data-neutral" },
  "La Niña": { barra: "fill-data-cold", legenda: "bg-data-cold" },
};

const ORDEM = ["El Niño", "Neutro", "La Niña"];

interface Props {
  zonas: ZonaFases[];
  de: number | null;
  ate: number | null;
}

export default function GraficoFases({ zonas, de, ate }: Props) {
  if (zonas.length === 0) {
    return (
      <p className="mt-5 mb-0 text-[14px] text-ink-secondary">
        Sem dados de chuva por fase para exibir.
      </p>
    );
  }

  const valores = zonas.flatMap((zona) =>
    zona.fases
      .map((fase) => fase.anomaliaPct)
      .filter((valor): valor is number => valor !== null),
  );

  const menor = Math.min(0, ...valores);
  const maior = Math.max(0, ...valores);
  const yMin = Math.floor(menor / 5) * 5;
  const yMax = Math.max(5, Math.ceil(maior / 5) * 5);

  const y = (valor: number) =>
    MARGEM.topo + ALTURA_PLOT - ((valor - yMin) / (yMax - yMin)) * ALTURA_PLOT;

  const base = MARGEM.topo + ALTURA_PLOT;
  const larguraGrupo = LARGURA_PLOT / zonas.length;
  const larguraBarra = Math.min(26, (larguraGrupo * 0.66) / ORDEM.length);

  const ticks: number[] = [];
  for (let valor = yMin; valor <= yMax; valor += 5) ticks.push(valor);

  return (
    <figure className="m-0 flex flex-col gap-3">
      <svg
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        className="mx-auto block h-auto w-full"
        role="img"
        aria-label={`Anomalia média da chuva por fase do ENSO, de ${de ?? "—"} a ${ate ?? "—"}.`}
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

        {zonas.map((zona, indiceZona) => {
          const centro = MARGEM.esquerda + larguraGrupo * (indiceZona + 0.5);
          const larguraTotal = larguraBarra * ORDEM.length + 3 * (ORDEM.length - 1);
          const inicio = centro - larguraTotal / 2;
          const porFase = new Map(zona.fases.map((fase) => [fase.fase, fase]));

          return (
            <g key={zona.zona}>
              {ORDEM.map((nomeFase, indiceBarra) => {
                const fase = porFase.get(nomeFase);
                if (!fase || fase.anomaliaPct === null) return null;

                const valor = fase.anomaliaPct;
                const x = inicio + indiceBarra * (larguraBarra + 3);
                const topo = valor >= 0 ? y(valor) : y(0);
                const altura = Math.abs(y(valor) - y(0));
                const cor = CORES[nomeFase] ?? CORES.Neutro!;

                return (
                  <g key={`${zona.zona}-${nomeFase}`}>
                    <rect
                      x={x}
                      y={topo}
                      width={larguraBarra}
                      height={Math.max(altura, 1)}
                      rx={2}
                      className={cor.barra}
                    >
                      <title>{`${zona.zona} · ${nomeFase}: ${formatarComSinal(valor)}% da média (${fase.meses} meses)`}</title>
                    </rect>
                    <text
                      x={x + larguraBarra / 2}
                      y={valor >= 0 ? topo - 4 : topo + altura + 11}
                      textAnchor="middle"
                      className="fill-ink font-data text-[9px]"
                    >
                      {valor === 0 || Math.abs(valor) < 0.5
                        ? "0"
                        : formatarComSinal(valor, 0)}
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
        {ORDEM.map((fase) => (
          <span key={fase} className="flex items-center gap-1.5">
            <span className={`${CORES[fase]?.legenda ?? "bg-data-neutral"} h-3 w-3 rounded-sm`} />
            {fase}
          </span>
        ))}
        <span className="ml-auto font-data">
          {de ?? "—"}–{ate ?? "—"}
        </span>
      </div>
    </figure>
  );
}
