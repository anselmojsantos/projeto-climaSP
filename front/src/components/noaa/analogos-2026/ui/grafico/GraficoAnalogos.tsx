import { useState } from "react";
import type { ReactNode } from "react";
import { formatarNumero } from "../../../lib/formato";
import { caminhoDe } from "../../../lib/svg";
import { LIMIAR_EL_NINO, LIMIAR_LA_NINA, PASSO_EIXO } from "../../../model/limiares";
import { PALETA_ANALOGOS } from "../../model/paleta";
import { CRITERIOS_ANALOGOS } from "../../model/criterios";
import type { AnalogoAno, Candidatos } from "../../model/types";

const LARGURA = 600;
const ALTURA = 320;
const MARGEM = { topo: 26, direita: 24, base: 44, esquerda: 56 };

const LARGURA_PLOT = LARGURA - MARGEM.esquerda - MARGEM.direita;
const ALTURA_PLOT = ALTURA - MARGEM.topo - MARGEM.base;

const COR_MEDIA = "#1f77b4";
const COR_ALVO = "#000000";

interface Props {
  temporadas: string[];
  alvo: (number | null)[];
  media: (number | null)[];
  candidatos: Candidatos | null;
  analogos: AnalogoAno[];
}

const CHAVE_MEDIA = "media";
const CHAVE_ALVO = "alvo";

interface PropsBotaoLegenda {
  chave: string;
  rotulo: string;
  ocultos: ReadonlySet<string>;
  alternar: (chave: string) => void;
  children: ReactNode;
}

function BotaoLegenda({
  chave,
  rotulo,
  ocultos,
  alternar,
  children,
}: PropsBotaoLegenda) {
  const oculto = ocultos.has(chave);
  return (
    <button
      type="button"
      onClick={() => alternar(chave)}
      aria-pressed={!oculto}
      title={`${oculto ? "Mostrar" : "Ocultar"} ${rotulo}`}
      className={`flex cursor-pointer items-center gap-1.5 rounded-full px-1.5 py-0.5 transition-opacity hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        oculto ? "opacity-40" : "opacity-100"
      }`}
    >
      {children}
    </button>
  );
}

function corDoAno(indice: number): string {
  return PALETA_ANALOGOS[indice % PALETA_ANALOGOS.length]!;
}

/** De onde saíram os análogos: universo amostrado e recorte final. */
function fraseAmostra(selecionados: number, candidatos: Candidatos | null): string {
  if (!candidatos) {
    return `dos anos com a janela JFM–ASO completa na base histórica do NOAA foram selecionados os ${selecionados} mais parecidos com 2026, pelos critérios abaixo.`;
  }

  const periodo =
    candidatos.de != null && candidatos.ate != null
      ? ` (${candidatos.de}–${candidatos.ate})`
      : "";

  return `de ${candidatos.total} anos com a janela JFM–ASO completa na base histórica do NOAA${periodo}, foram selecionados os ${selecionados} mais parecidos com 2026, pelos critérios abaixo.`;
}

export default function GraficoAnalogos({
  temporadas,
  alvo,
  media,
  candidatos,
  analogos,
}: Props) {
  const [ocultos, setOcultos] = useState<ReadonlySet<string>>(() => new Set());

  const alternar = (chave: string) =>
    setOcultos((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(chave)) proximo.delete(chave);
      else proximo.add(chave);
      return proximo;
    });

  const todos = [
    ...analogos.flatMap((analogo) => analogo.valores),
    ...alvo,
    ...media,
  ].filter((valor): valor is number => valor !== null);

  if (todos.length === 0 || temporadas.length === 0) {
    return (
      <p className="mt-5 mb-0 text-[14px] text-ink-secondary">
        Sem dados de análogos para exibir.
      </p>
    );
  }

  const yMin = Math.floor(Math.min(LIMIAR_LA_NINA, ...todos) / PASSO_EIXO) * PASSO_EIXO;
  const yMax = Math.ceil(Math.max(LIMIAR_EL_NINO, ...todos) / PASSO_EIXO) * PASSO_EIXO;
  const passos = Math.round((yMax - yMin) / PASSO_EIXO);
  const ticks = Array.from({ length: passos + 1 }, (_, i) => yMin + i * PASSO_EIXO);

  const x = (indice: number) =>
    MARGEM.esquerda + ((indice + 0.5) * LARGURA_PLOT) / temporadas.length;
  const y = (valor: number) =>
    MARGEM.topo + ALTURA_PLOT - ((valor - yMin) / (yMax - yMin)) * ALTURA_PLOT;

  const base = MARGEM.topo + ALTURA_PLOT;
  const fim = MARGEM.esquerda + LARGURA_PLOT;

  return (
    <figure className="m-0 flex flex-col gap-4 rounded-2xl bg-soft p-4 xl:flex-row xl:items-start 2xl:flex-col">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="w-full">
          <svg
            viewBox={`0 0 ${LARGURA} ${ALTURA}`}
            className="mx-auto block h-auto w-full"
            role="img"
            aria-label={`Curvas de JFM a ASO de ${analogos.length} anos análogos, a média dos análogos e o alvo 2026.`}
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
  
            <line
              x1={MARGEM.esquerda}
              x2={fim}
              y1={y(LIMIAR_EL_NINO)}
              y2={y(LIMIAR_EL_NINO)}
              stroke="#d62728"
              strokeDasharray="2 4"
              strokeWidth={1.5}
              opacity={0.5}
            />
            <line
              x1={MARGEM.esquerda}
              x2={fim}
              y1={y(LIMIAR_LA_NINA)}
              y2={y(LIMIAR_LA_NINA)}
              stroke="#1f77b4"
              strokeDasharray="2 4"
              strokeWidth={1.5}
              opacity={0.5}
            />
            <line
              x1={MARGEM.esquerda}
              x2={fim}
              y1={y(0)}
              y2={y(0)}
              stroke="#7f7f7f"
              strokeDasharray="2 4"
              strokeWidth={1.5}
              opacity={0.3}
            />
  
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
  
            {analogos.map((analogo, indice) =>
              ocultos.has(String(indice)) ? null : (
                <g key={analogo.ano ?? indice}>
                  <path
                    d={caminhoDe(analogo.valores, x, y)}
                    fill="none"
                    stroke={corDoAno(indice)}
                    strokeWidth={1.8}
                    opacity={0.8}
                  />
                  {analogo.valores.map((valor, posicao) =>
                    valor === null ? null : (
                      <circle
                        key={`${analogo.ano}-${temporadas[posicao]}`}
                        cx={x(posicao)}
                        cy={y(valor)}
                        r={2.5}
                        fill={corDoAno(indice)}
                        opacity={0.8}
                      >
                        <title>
                          {`${analogo.ano} · ${temporadas[posicao]}: ${formatarNumero(valor)} °C`}
                        </title>
                      </circle>
                    ),
                  )}
                </g>
              ),
            )}
  
            {ocultos.has(CHAVE_MEDIA) ? null : (
              <>
                <path
                  d={caminhoDe(media, x, y)}
                  fill="none"
                  stroke={COR_MEDIA}
                  strokeDasharray="6 4"
                  strokeWidth={2.5}
                />
  
                {media.map((valor, posicao) =>
                  valor === null ? null : (
                    <circle
                      key={`media-${temporadas[posicao]}`}
                      cx={x(posicao)}
                      cy={y(valor)}
                      r={4}
                      fill={COR_MEDIA}
                    >
                      <title>
                        {`Média dos análogos · ${temporadas[posicao]}: ${formatarNumero(valor)} °C`}
                      </title>
                    </circle>
                  ),
                )}
              </>
            )}
  
            {ocultos.has(CHAVE_ALVO) ? null : (
              <>
                <path
                  d={caminhoDe(alvo, x, y)}
                  fill="none"
                  stroke={COR_ALVO}
                  strokeWidth={3.5}
                />
  
                {alvo.map((valor, posicao) =>
                  valor === null ? null : (
                    <circle
                      key={`alvo-${temporadas[posicao]}`}
                      cx={x(posicao)}
                      cy={y(valor)}
                      r={5.5}
                      fill={COR_ALVO}
                      className="stroke-bg"
                      strokeWidth={1.5}
                    >
                      <title>
                        {`2026 (alvo) · ${temporadas[posicao]}: ${formatarNumero(valor)} °C`}
                      </title>
                    </circle>
                  ),
                )}
              </>
            )}
  
            {temporadas.map((temporada, indice) => (
              <text
                key={`eixo-x-${temporada}`}
                x={x(indice)}
                y={base + 22}
                textAnchor="middle"
                className="fill-ink-secondary text-[12px]"
              >
                {temporada}
              </text>
            ))}
          </svg>
        </div>
  
        <div className="mx-auto flex w-full flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-ink-secondary">
          {analogos.map((analogo, indice) => (
            <BotaoLegenda
              key={analogo.ano ?? indice}
              chave={String(indice)}
              rotulo={String(analogo.ano ?? indice)}
              ocultos={ocultos}
              alternar={alternar}
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: corDoAno(indice) }}
              />
              {analogo.ano}
            </BotaoLegenda>
          ))}
  
          <BotaoLegenda
            chave={CHAVE_MEDIA}
            rotulo="a média dos análogos"
            ocultos={ocultos}
            alternar={alternar}
          >
            <span
              className="h-0 w-5 border-t-2 border-dashed"
              style={{ borderColor: COR_MEDIA }}
            />
            Média dos análogos
          </BotaoLegenda>
  
          <BotaoLegenda
            chave={CHAVE_ALVO}
            rotulo="o alvo 2026"
            ocultos={ocultos}
            alternar={alternar}
          >
            <span className="h-0 w-5 border-t-2" style={{ borderColor: COR_ALVO }} />
            2026 (alvo)
          </BotaoLegenda>
  
          <span className="flex items-center gap-1.5">
            <span className="h-0 w-5 border-t border-dashed border-ink-secondary" />
            limiares ±0,5 °C
          </span>
  
          <span className="w-full text-[13px] italic">
            Clique na legenda para ocultar ou mostrar uma curva.
          </span>
        </div>

      </div>
      <figcaption className="flex min-w-0 flex-col gap-2 text-[14px] leading-[1.45] text-data-neutral xl:w-[360px] xl:shrink-0 2xl:w-auto">
        <p className="m-0">
          <span className="font-semibold text-ink-secondary">Amostra:</span>{" "}
          {fraseAmostra(analogos.length, candidatos)}
        </p>

        <table className="w-full border-collapse text-left text-[14px]">
          <caption className="sr-only">
            Critérios usados para selecionar os anos análogos de 2026
          </caption>
          <thead>
            <tr className="text-ink-secondary">
              <th scope="col" className="border-b border-data-neutral/30 py-1 pr-3 font-semibold">
                Critério
              </th>
              <th scope="col" className="border-b border-data-neutral/30 py-1 pr-3 font-semibold">
                Limiar
              </th>
              <th scope="col" className="border-b border-data-neutral/30 py-1 font-semibold">
                O que mede
              </th>
            </tr>
          </thead>
          <tbody>
            {CRITERIOS_ANALOGOS.map((criterio) => (
              <tr key={criterio.nome}>
                <th
                  scope="row"
                  className="border-b border-data-neutral/15 py-1 pr-3 text-left font-normal text-ink-secondary"
                >
                  {criterio.nome}
                </th>
                <td className="border-b border-data-neutral/15 py-1 pr-3 whitespace-nowrap">
                  {criterio.limiar}
                </td>
                <td className="border-b border-data-neutral/15 py-1">{criterio.mede}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="m-0">
          <span className="font-semibold text-ink-secondary">Temporadas:</span> cada rótulo é
          uma janela de 3 meses que termina no mês da última letra — JFM = jan–fev–mar, FMA =
          fev–mar–abr, MAM = mar–abr–mai, AMJ = abr–mai–jun, MJJ = mai–jun–jul, JJA = jun–jul–ago,
          JAS = jul–ago–set e ASO = ago–set–out. Cada valor é a média móvel de 3 meses (MM3) do RONI/ONI: no
          notebook, as médias mensais das leituras semanais da NOAA recebem uma janela
          deslizante de 3 meses.
        </p>
      </figcaption>
    </figure>
  );
}
