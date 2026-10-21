import { formatarNumero } from "../../../lib/formato";
import { caminhoDe } from "../../../lib/svg";
import { PASSO_EIXO } from "../../../model/limiares";
import { COR_NEUTRA_REGIAO, CORES_REGIOES } from "../../model/cores";
import type { PontoMediaMensal, RegiaoMediaMensal } from "../../model/types";

const LARGURA = 520;
const ALTURA = 320;
const MARGEM = { topo: 26, direita: 18, base: 44, esquerda: 44 };

const LARGURA_PLOT = LARGURA - MARGEM.esquerda - MARGEM.direita;
const ALTURA_PLOT = ALTURA - MARGEM.topo - MARGEM.base;

const COR_ZERO = "#d62728";

interface Props {
  ano: number;
  regioes: RegiaoMediaMensal[];
  serie: PontoMediaMensal[];
}

function valorDe(ponto: PontoMediaMensal, chave: string): number | null {
  switch (chave) {
    case "nino12":
      return ponto.nino12;
    case "nino3":
      return ponto.nino3;
    case "nino34":
      return ponto.nino34;
    case "nino4":
      return ponto.nino4;
    default:
      return null;
  }
}

export default function GraficoMediaMensal({ ano, regioes, serie }: Props) {
  const series = regioes
    .map((regiao) => ({
      ...regiao,
      cor: CORES_REGIOES[regiao.chave] ?? COR_NEUTRA_REGIAO,
      valores: serie.map((ponto) => valorDe(ponto, regiao.chave)),
    }))
    .filter((regiao) => regiao.valores.some((valor) => valor !== null));

  const todos = series
    .flatMap((regiao) => regiao.valores)
    .filter((valor): valor is number => valor !== null);

  if (todos.length === 0 || serie.length === 0) {
    return (
      <p className="mt-5 mb-0 text-[14px] text-ink-secondary">
        Sem médias mensais para exibir.
      </p>
    );
  }

  const yMin = Math.floor(Math.min(0, ...todos) / PASSO_EIXO) * PASSO_EIXO;
  const yMax = Math.ceil(Math.max(0, ...todos) / PASSO_EIXO) * PASSO_EIXO;
  const passos = Math.round((yMax - yMin) / PASSO_EIXO);
  const ticks = Array.from({ length: passos + 1 }, (_, i) => yMin + i * PASSO_EIXO);

  const x = (indice: number) =>
    serie.length === 1
      ? MARGEM.esquerda + LARGURA_PLOT / 2
      : MARGEM.esquerda + (indice * LARGURA_PLOT) / (serie.length - 1);
  const y = (valor: number) =>
    MARGEM.topo + ALTURA_PLOT - ((valor - yMin) / (yMax - yMin)) * ALTURA_PLOT;

  const base = MARGEM.topo + ALTURA_PLOT;
  const fim = MARGEM.esquerda + LARGURA_PLOT;

  return (
    <figure className="m-0 flex flex-col gap-3 rounded-2xl bg-soft p-4">
      <div className="w-full">
        <svg
          viewBox={`0 0 ${LARGURA} ${ALTURA}`}
          className="mx-auto block h-auto w-full max-w-[600px]"
          role="img"
          aria-label={`Média mensal da anomalia de TSM em ${ano} nas quatro regiões Niño, de ${serie[0]?.mes} a ${serie[serie.length - 1]?.mes}.`}
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

          <line
            x1={MARGEM.esquerda}
            x2={fim}
            y1={y(0)}
            y2={y(0)}
            stroke={COR_ZERO}
            strokeDasharray="6 4"
            strokeWidth={1.5}
          />

          {series.map((regiao) => (
            <g key={regiao.chave}>
              <path
                d={caminhoDe(regiao.valores, x, y)}
                fill="none"
                stroke={regiao.cor}
                strokeWidth={2.5}
              />
              {regiao.valores.map((valor, indice) =>
                valor === null ? null : (
                  <circle
                    key={`${regiao.chave}-${serie[indice]?.mes}`}
                    cx={x(indice)}
                    cy={y(valor)}
                    r={3}
                    fill={regiao.cor}
                  >
                    <title>
                      {`${regiao.nome} · ${serie[indice]?.rotulo}: ${formatarNumero(valor)} °C`}
                    </title>
                  </circle>
                ),
              )}
            </g>
          ))}

          {serie.map((ponto, indice) => (
            <text
              key={`eixo-x-${ponto.mes}`}
              x={x(indice)}
              y={base + 22}
              textAnchor="middle"
              className="fill-ink-secondary text-[12px]"
            >
              {ponto.mes}
            </text>
          ))}
        </svg>
      </div>

      <div className="mx-auto flex w-full max-w-[600px] flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-ink-secondary">
        {series.map((regiao) => (
          <span key={regiao.chave} className="flex items-center gap-1.5">
            <span
              className="h-0 w-5 border-t-2"
              style={{ borderColor: regiao.cor }}
            />
            {regiao.nome}
          </span>
        ))}

        <span className="flex items-center gap-1.5">
          <span
            className="h-0 w-5 border-t border-dashed"
            style={{ borderColor: COR_ZERO }}
          />
          0 °C
        </span>
      </div>

      <figcaption className="mx-auto w-full max-w-[600px] text-[14px] leading-[1.45] text-data-neutral">
        Média das leituras semanais da NOAA agrupadas por mês (Niño 3.4 é a região do índice
        RONI/ONI).
      </figcaption>
    </figure>
  );
}
