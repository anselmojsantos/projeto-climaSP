import { formatarNumero } from "../../../lib/formato";
import { PALETA_ANALOGOS } from "../../../analogos-2026/model/paleta";
import type { SerieValidacao } from "../../model/types";

const LARGURA = 600;
const GAP_X = 26;
const GAP_Y = 34;
const COLUNAS = 2;
const ALTURA_PAINEL = 206;
const MARGEM = { topo: 30, direita: 16, base: 44, esquerda: 58 };

const PASSO_EIXO = 0.5;
const COR_RETA = "#1f77b4";
const COR_2026 = "#000000";

interface Props {
  series: SerieValidacao[];
  aso2026: number | null;
}

interface Dominio {
  min: number;
  max: number;
  ticks: number[];
}

function dominio(valores: number[], pad = 0.1): Dominio {
  const min = Math.floor((Math.min(...valores) - pad) / PASSO_EIXO) * PASSO_EIXO;
  const max = Math.ceil((Math.max(...valores) + pad) / PASSO_EIXO) * PASSO_EIXO;
  const passos = Math.max(1, Math.round((max - min) / PASSO_EIXO));
  return {
    min,
    max,
    ticks: Array.from({ length: passos + 1 }, (_, i) => min + i * PASSO_EIXO),
  };
}

function estrela(cx: number, cy: number, raio: number): string {
  const pontos: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? raio : raio * 0.45;
    const angulo = -Math.PI / 2 + (i * Math.PI) / 5;
    pontos.push(`${cx + r * Math.cos(angulo)},${cy + r * Math.sin(angulo)}`);
  }
  return pontos.join(" ");
}

function mediana(valores: number[]): number | null {
  if (valores.length === 0) return null;
  const ordenados = [...valores].sort((a, b) => a - b);
  const meio = Math.floor(ordenados.length / 2);
  return ordenados.length % 2 === 0
    ? (ordenados[meio - 1]! + ordenados[meio]!) / 2
    : ordenados[meio]!;
}

export default function GraficoValidacao({ series, aso2026 }: Props) {
  if (series.length === 0) {
    return (
      <p className="mt-5 mb-0 text-[14px] text-ink-secondary">
        Sem dados de validação para exibir.
      </p>
    );
  }

  // O numero de paineis vem do backend: a projecao pode ter 3 horizontes
  // (SON-NDJ) ou 5 (SON-JFM do ano seguinte), e a grade acompanha.
  const paineis = series;
  const linhas = Math.max(1, Math.ceil(paineis.length / COLUNAS));
  const larguraPlot = LARGURA - MARGEM.esquerda - MARGEM.direita;
  const larguraPainel = (larguraPlot - GAP_X * (COLUNAS - 1)) / COLUNAS;
  const alturaPlot = linhas * ALTURA_PAINEL + (linhas - 1) * GAP_Y;
  const altura = MARGEM.topo + alturaPlot + MARGEM.base;

  const valoresX = [
    ...paineis.flatMap((serie) => serie.pontos.map((ponto) => ponto.aso)),
    ...(aso2026 !== null ? [aso2026] : []),
  ];
  const valoresY = [
    ...paineis.flatMap((serie) => serie.pontos.map((ponto) => ponto.valor)),
    ...paineis.flatMap((serie) => (serie.alvo2026 !== null ? [serie.alvo2026] : [])),
  ];

  const dominioX = dominio(valoresX);
  const dominioY = dominio(valoresY);

  const escalaX = (valor: number) =>
    (valor - dominioX.min) / (dominioX.max - dominioX.min);
  const escalaY = (valor: number) =>
    (valor - dominioY.min) / (dominioY.max - dominioY.min);

  const serieFinal = paineis[paineis.length - 1];
  const medianaFinal = serieFinal
    ? mediana(serieFinal.pontos.map((ponto) => ponto.valor))
    : null;
  const minimoFinal = serieFinal
    ? Math.min(...serieFinal.pontos.map((ponto) => ponto.valor))
    : null;
  const maximoFinal = serieFinal
    ? Math.max(...serieFinal.pontos.map((ponto) => ponto.valor))
    : null;
  const asoMinFinal = serieFinal
    ? Math.min(...serieFinal.pontos.map((ponto) => ponto.aso))
    : null;
  const asoMaxFinal = serieFinal
    ? Math.max(...serieFinal.pontos.map((ponto) => ponto.aso))
    : null;
  const proximosFinal =
    serieFinal && aso2026 !== null
      ? [...serieFinal.pontos]
          .sort(
            (a, b) => Math.abs(a.aso - aso2026) - Math.abs(b.aso - aso2026),
          )
          .slice(0, 2)
      : [];

  const primeira = paineis[0]!;
  const ultima = paineis[paineis.length - 1]!;

  const resumo = paineis
    .map(
      (serie) =>
        `${serie.temporada} R ao quadrado ${formatarNumero(serie.reta.r2, 2)}, RMSE ${formatarNumero(serie.reta.rmse, 2)} graus`,
    )
    .join("; ");

  return (
    <figure className="m-0 flex flex-col gap-4 rounded-2xl bg-soft p-4 xl:flex-row xl:items-start 2xl:flex-col">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="w-full">
          <svg
            viewBox={`0 0 ${LARGURA} ${altura}`}
            className="mx-auto block h-auto w-full"
            role="img"
            aria-label={`Dispersão dos ${primeira.pontos.length} anos análogos em ${paineis.length} horizontes, com a reta de regressão de cada temporada e a projeção de 2026. ${resumo}.`}
          >
            {paineis.map((serie, indice) => {
              const coluna = indice % COLUNAS;
              const linha = Math.floor(indice / COLUNAS);
              const ox = MARGEM.esquerda + coluna * (larguraPainel + GAP_X);
              const oy = MARGEM.topo + linha * (ALTURA_PAINEL + GAP_Y);
              const base = oy + ALTURA_PAINEL;
              const fim = ox + larguraPainel;
              const ultimaLinha = linha === Math.floor((paineis.length - 1) / COLUNAS);

              const x = (valor: number) => ox + escalaX(valor) * larguraPainel;
              const y = (valor: number) => base - escalaY(valor) * ALTURA_PAINEL;

              const xRetaMin = Math.min(
                ...serie.pontos.map((ponto) => ponto.aso),
              );
              const xRetaMax = Math.max(
                ...serie.pontos.map((ponto) => ponto.aso),
              );

              return (
                <g key={serie.temporada}>
                  <text
                    x={ox}
                    y={oy - 10}
                    className="fill-ink text-[12px] font-semibold"
                  >
                    {serie.temporada}
                  </text>
                  <text
                    x={fim}
                    y={oy - 10}
                    textAnchor="end"
                    className="fill-data-neutral text-[10px]"
                  >
                    R² {formatarNumero(serie.reta.r2, 2)}
                  </text>

                  {dominioY.ticks.map((tick) => (
                    <line
                      key={`grade-y-${serie.temporada}-${tick}`}
                      x1={ox}
                      x2={fim}
                      y1={y(tick)}
                      y2={y(tick)}
                      className="stroke-data-neutral/20"
                      strokeWidth={1}
                    />
                  ))}
                  {dominioX.ticks.map((tick) => (
                    <line
                      key={`grade-x-${serie.temporada}-${tick}`}
                      x1={x(tick)}
                      x2={x(tick)}
                      y1={oy}
                      y2={base}
                      className="stroke-data-neutral/20"
                      strokeWidth={1}
                    />
                  ))}

                  {coluna === 0 &&
                    dominioY.ticks.map((tick) => (
                      <text
                        key={`eixo-y-${serie.temporada}-${tick}`}
                        x={ox - 8}
                        y={y(tick)}
                        textAnchor="end"
                        dominantBaseline="middle"
                        className="fill-data-neutral text-[10px]"
                      >
                        {formatarNumero(tick, 1)}
                      </text>
                    ))}

                  {ultimaLinha &&
                    dominioX.ticks.map((tick) => (
                      <text
                        key={`eixo-x-${serie.temporada}-${tick}`}
                        x={x(tick)}
                        y={base + 16}
                        textAnchor="middle"
                        className="fill-data-neutral text-[10px]"
                      >
                        {formatarNumero(tick, 1)}
                      </text>
                    ))}

                  <line
                    x1={x(xRetaMin)}
                    y1={y(serie.reta.a * xRetaMin + serie.reta.b)}
                    x2={x(xRetaMax)}
                    y2={y(serie.reta.a * xRetaMax + serie.reta.b)}
                    stroke={COR_RETA}
                    strokeWidth={2}
                  />

                  {serie.pontos.map((ponto) => (
                    <circle
                      key={`${serie.temporada}-${ponto.ano}`}
                      cx={x(ponto.aso)}
                      cy={y(ponto.valor)}
                      r={3.6}
                      fill={PALETA_ANALOGOS[ponto.indice % PALETA_ANALOGOS.length]}
                      className="stroke-bg"
                      strokeWidth={1}
                    >
                      <title>
                        {`${ponto.ano}: ASO ${formatarNumero(ponto.aso)} °C · ${serie.temporada} ${formatarNumero(ponto.valor)} °C`}
                      </title>
                    </circle>
                  ))}

                  {serie.alvo2026 !== null && aso2026 !== null && (
                    <polygon
                      points={estrela(x(aso2026), y(serie.alvo2026), 6.5)}
                      fill={COR_2026}
                      className="stroke-bg"
                      strokeWidth={1.2}
                    >
                      <title>
                        {`2026 projetado · ${serie.temporada}: ${formatarNumero(serie.alvo2026)} °C`}
                      </title>
                    </polygon>
                  )}
                </g>
              );
            })}

            <text
              x={MARGEM.esquerda + larguraPlot / 2}
              y={altura - 8}
              textAnchor="middle"
              className="fill-ink-secondary text-[11px]"
            >
              RONI observado em ASO (°C)
            </text>
            <text
              x={16}
              y={MARGEM.topo + alturaPlot / 2}
              textAnchor="middle"
              transform={`rotate(-90 16 ${MARGEM.topo + alturaPlot / 2})`}
              className="fill-ink-secondary text-[11px]"
            >
              RONI observado na temporada (°C)
            </text>
          </svg>
        </div>

        <div className="mx-auto flex w-full flex-wrap items-center gap-4 text-[14px] text-ink-secondary">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full border border-bg bg-data-neutral" />
            um ponto por ano análogo
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0 w-5 border-t-2" style={{ borderColor: COR_RETA }} />
            reta da temporada
          </span>
          <span className="flex items-center gap-1.5">
            <svg viewBox="-9 -9 18 18" className="h-3 w-3" aria-hidden="true">
              <polygon points={estrela(0, 0, 7)} fill={COR_2026} />
            </svg>
            2026 projetado
          </span>
        </div>
      </div>

      <figcaption className="flex min-w-0 flex-col gap-2 text-[14px] leading-[1.45] text-data-neutral xl:w-[360px] xl:shrink-0 2xl:w-auto">
        <p className="m-0">
          <span className="font-semibold text-ink-secondary">O que mostra:</span> cada ponto
          é um dos {primeira.pontos.length} anos análogos, repetido em {paineis.length}{" "}
          painéis. O eixo horizontal é sempre o RONI observado em ASO; o vertical, o RONI
          observado na temporada do painel. A reta azul é a regressão linear treinada nesses
          anos — a mesma que gera a projeção; a estrela aplica o ASO de 2026 à reta de cada
          horizonte.
        </p>

        <table className="w-full border-collapse text-left text-[14px]">
          <caption className="sr-only">
            Métricas do ajuste da reta por temporada futura
          </caption>
          <thead>
            <tr className="text-ink-secondary">
              <th scope="col" className="border-b border-data-neutral/30 py-1 pr-3 font-semibold">
                Temporada
              </th>
              <th scope="col" className="border-b border-data-neutral/30 py-1 pr-3 font-semibold">
                R²
              </th>
              <th scope="col" className="border-b border-data-neutral/30 py-1 pr-3 font-semibold">
                RMSE (°C)
              </th>
              <th scope="col" className="border-b border-data-neutral/30 py-1 font-semibold">
                LOO (°C)
              </th>
            </tr>
          </thead>
          <tbody>
            {paineis.map((serie) => (
              <tr key={serie.temporada}>
                <th
                  scope="row"
                  className="border-b border-data-neutral/15 py-1 pr-3 text-left font-normal text-ink-secondary"
                >
                  {serie.temporada}
                </th>
                <td className="border-b border-data-neutral/15 py-1 pr-3 whitespace-nowrap">
                  {formatarNumero(serie.reta.r2, 2)}
                </td>
                <td className="border-b border-data-neutral/15 py-1 pr-3 whitespace-nowrap">
                  {formatarNumero(serie.reta.rmse, 2)}
                </td>
                <td className="border-b border-data-neutral/15 py-1 whitespace-nowrap">
                  {formatarNumero(serie.reta.rmseLoo, 2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="m-0">
          <span className="font-semibold text-ink-secondary">Interpretação:</span> os{" "}
          {primeira.pontos.length} anos não são uma amostra aleatória: foram escolhidos por
          terem a curva JFM–ASO mais parecida com a de 2026 — correlação alta (r ≥ 0,90),
          RMSE baixo, amplitude ≥ 0,60 e no máximo cinco trimestres divergentes. A
          validação testa se a relação ASO → temporada se mantém nesses anos e se a reta
          generaliza; não testa o desfecho de 2026.
        </p>

        <p className="m-0">
          O ajuste é forte em {primeira.temporada} (R²{" "}
          {formatarNumero(primeira.reta.r2, 2)}) porque, perto da janela de seleção, os anos
          se parecem e o evento persiste de ASO para {primeira.temporada}.{" "}
          {primeira.temporada}–{ultima.temporada} não entraram na escolha; a queda do R² até{" "}
          {ultima.temporada} ({formatarNumero(ultima.reta.r2, 2)}) mostra que a precisão
          diminui com o prazo — não que a estimativa seja inválida.
        </p>

        {serieFinal &&
        serieFinal.alvo2026 !== null &&
        aso2026 !== null &&
        medianaFinal !== null &&
        minimoFinal !== null &&
        maximoFinal !== null &&
        asoMinFinal !== null &&
        asoMaxFinal !== null ? (
          <p className="m-0">
            Em {serieFinal.temporada}, a estimativa central é{" "}
            {formatarNumero(serieFinal.alvo2026, 2)} °C, condicional a ASO{" "}
            {formatarNumero(aso2026, 3)} (
            {aso2026 > asoMaxFinal
              ? "acima do topo da faixa"
              : aso2026 < asoMinFinal
                ? "abaixo da base da faixa"
                : "dentro da faixa"}{" "}
            {formatarNumero(asoMinFinal, 2)}–{formatarNumero(asoMaxFinal, 2)}); os dois
            análogos mais próximos nesse ponto
            {proximosFinal.length === 2 && proximosFinal[0] && proximosFinal[1] ? (
              <>
                {" "}
                ({proximosFinal[0].ano} e {proximosFinal[1].ano}) tiveram{" "}
                {formatarNumero(proximosFinal[0].valor, 2)} e{" "}
                {formatarNumero(proximosFinal[1].valor, 2)} °C
              </>
            ) : null}
            . A mediana de {formatarNumero(medianaFinal, 2)} °C e a faixa de{" "}
            {formatarNumero(minimoFinal, 2)}–{formatarNumero(maximoFinal, 2)} °C são
            incondicionais — misturam anos de ASO mais baixo. O RMSE do ajuste (
            {formatarNumero(serieFinal.reta.rmse, 2)} °C) e o LOO (
            {formatarNumero(serieFinal.reta.rmseLoo, 2)} °C) estão próximos, então a reta
            generaliza: a margem de erro em {serieFinal.temporada} é de ~
            {formatarNumero(serieFinal.reta.rmseLoo, 2)} °C.
          </p>
        ) : null}
      </figcaption>
    </figure>
  );
}
