import { useEffect, useState } from "react";
import GraficoChuva from "./grafico/GraficoChuva";
import GraficoNino from "./grafico/GraficoNino";
import {
  formatarComSinal,
  formatarDecimal,
} from "../../lib/formato";
import type {
  EstadoProjecao,
  MesProjecao,
  Props,
  RespostaProjecao,
  ZonaProjecao,
} from "../model/types";

function media(valores: number[]): number | null {
  if (valores.length === 0) return null;
  return valores.reduce((soma, valor) => soma + valor, 0) / valores.length;
}

interface ResumoMes extends MesProjecao {
  normal: number | null;
  esperado: number | null;
  desvio: number | null;
  min: number | null;
  max: number | null;
}

function resumirMes(mes: MesProjecao, zonas: ZonaProjecao[]): ResumoMes {
  const doMes = zonas.filter((zona) => zona.mes === mes.mes);
  const desvios = doMes
    .map((zona) => zona.desvioPct)
    .filter((valor): valor is number => valor !== null);
  const normais = doMes
    .map((zona) => zona.chuvaNormalMm)
    .filter((valor): valor is number => valor !== null);
  const esperados = doMes
    .map((zona) => zona.chuvaEsperadaMm)
    .filter((valor): valor is number => valor !== null);

  return {
    ...mes,
    normal: media(normais),
    esperado: media(esperados),
    desvio: media(desvios),
    min: desvios.length > 0 ? Math.min(...desvios) : null,
    max: desvios.length > 0 ? Math.max(...desvios) : null,
  };
}

export default function Projecao({ baseApi }: Props) {
  const [estado, setEstado] = useState<EstadoProjecao>({ fase: "carregando" });

  useEffect(() => {
    let cancelado = false;
    (async () => {
      setEstado({ fase: "carregando" });
      try {
        const resposta = await fetch(`${baseApi}/api/chuvas/projecao`);
        if (!resposta.ok) throw new Error(`Backend respondeu com HTTP ${resposta.status}.`);
        const dados = (await resposta.json()) as RespostaProjecao;
        if (cancelado) return;
        setEstado({
          fase: "ok",
          meses: dados.meses ?? [],
          zonas: dados.zonas ?? [],
        });
      } catch (erro) {
        if (cancelado) return;
        setEstado({
          fase: "erro",
          mensagem:
            erro instanceof Error
              ? erro.message
              : "Não foi possível carregar a projeção de chuva.",
        });
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [baseApi]);

  const meses = estado.fase === "ok" ? estado.meses : [];
  const zonas = estado.fase === "ok" ? estado.zonas : [];
  const resumo = meses.map((mes) => resumirMes(mes, zonas));

  const desvios = zonas
    .map((zona) => zona.desvioPct)
    .filter((valor): valor is number => valor !== null);
  const desviosMm = zonas
    .map((zona) => zona.desvioMm)
    .filter((valor): valor is number => valor !== null);
  const ninos = meses.map((mes) => mes.nino34);

  const minPct = desvios.length > 0 ? Math.min(...desvios) : null;
  const maxPct = desvios.length > 0 ? Math.max(...desvios) : null;
  const minMm = desviosMm.length > 0 ? Math.min(...desviosMm) : null;
  const maxMm = desviosMm.length > 0 ? Math.max(...desviosMm) : null;
  const ninoMin = ninos.length > 0 ? Math.min(...ninos) : null;
  const ninoMax = ninos.length > 0 ? Math.max(...ninos) : null;

  const janFev = zonas
    .filter((zona) => zona.mesNum === 1 || zona.mesNum === 2)
    .map((zona) => zona.desvioPct)
    .filter((valor): valor is number => valor !== null);
  const janFevMin = janFev.length > 0 ? Math.min(...janFev) : null;
  const janFevMax = janFev.length > 0 ? Math.max(...janFev) : null;

  return (
    <section
      aria-labelledby="impactos-projecao"
      className="border-t border-data-neutral/15 pt-10"
    >
      <p className="m-0 mb-1 text-[11px] uppercase tracking-wide text-ink-secondary">
        4 · Projeção
      </p>
      <h2
        id="impactos-projecao"
        className="m-0 text-[21px] leading-[1.2] font-semibold"
      >
        O que esperar de outubro de 2026 a fevereiro de 2027
      </h2>

      <div className="mt-2 flex max-w-[820px] flex-col gap-2 text-[15px] leading-[1.5] text-ink-secondary">
        <p className="m-0">
          O Pacífico deve continuar quente. A projeção usada aqui é a mesma da
          página{" "}
          <a
            href="/dados-noaa/#roni-2026"
            className="text-accent underline underline-offset-2"
          >
            Dados NOAA
          </a>
          , feita com o modelo de anos análogos. No período, ela fica entre{" "}
          {ninoMin === null ? "—" : `${formatarDecimal(ninoMin, 1)} °C`} e{" "}
          {ninoMax === null ? "—" : `${formatarDecimal(ninoMax, 1)} °C`}.
        </p>
        <p className="m-0">
          {estado.fase === "ok" ? (
            <>
              Aplicando a relação dos 65 anos, a chuva deve ficar acima da
              normal em todos os meses e zonas. O desvio vai de{" "}
              {minPct === null ? "—" : `${formatarComSinal(minPct, 1)}%`} a{" "}
              {maxPct === null ? "—" : `${formatarComSinal(maxPct, 1)}%`}, ou{" "}
              {minMm === null ? "—" : `${formatarComSinal(minMm, 1)} mm`} a{" "}
              {maxMm === null ? "—" : `${formatarComSinal(maxMm, 1)} mm`}. O
              maior desvio percentual aparece em outubro e novembro. Em janeiro
              e fevereiro, fica entre{" "}
              {janFevMin === null ? "—" : `${formatarComSinal(janFevMin, 1)}%`} e{" "}
              {janFevMax === null ? "—" : `${formatarComSinal(janFevMax, 1)}%`}.
            </>
          ) : (
            "A projeção aplica a relação histórica entre o Pacífico e a chuva."
          )}
        </p>
        <p className="m-0">
          Em outubro, a chuva normal é menor, então o mesmo ganho em milímetros
          pesa mais no porcentual. O modelo erra cerca de 54 mm por mês. O
          desvio projetado é menor que esse erro. Então a tendência é de chuva
          acima da média, mas o tamanho exato não é confiável.
        </p>
      </div>

      {estado.fase === "carregando" && (
        <p className="mt-5 mb-0 text-[14px] text-ink-secondary">
          Carregando a projeção…
        </p>
      )}

      {estado.fase === "erro" && (
        <p role="alert" className="mt-5 mb-0 text-[14px] text-data-warm">
          Não foi possível carregar a projeção: {estado.mensagem}
        </p>
      )}

      {estado.fase === "ok" && (
        <div className="mt-5 flex flex-col gap-5">
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <GraficoNino meses={meses} />
            <GraficoChuva meses={meses} zonas={zonas} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13px]">
              <caption className="mb-1 text-left text-[13px] text-ink-secondary">
                Média das cinco zonas. A faixa mostra o menor e o maior desvio
                entre as zonas.
              </caption>
              <thead>
                <tr className="text-ink-secondary">
                  <th
                    scope="col"
                    className="border-b border-data-neutral/30 py-1 pr-3 font-semibold"
                  >
                    Mês
                  </th>
                  <th
                    scope="col"
                    className="border-b border-data-neutral/30 py-1 pr-3 font-semibold"
                  >
                    Niño 3.4
                  </th>
                  <th
                    scope="col"
                    className="border-b border-data-neutral/30 py-1 pr-3 font-semibold"
                  >
                    Chuva normal
                  </th>
                  <th
                    scope="col"
                    className="border-b border-data-neutral/30 py-1 pr-3 font-semibold"
                  >
                    Chuva esperada
                  </th>
                  <th
                    scope="col"
                    className="border-b border-data-neutral/30 py-1 pr-3 font-semibold"
                  >
                    Desvio
                  </th>
                  <th
                    scope="col"
                    className="border-b border-data-neutral/30 py-1 font-semibold"
                  >
                    Faixa entre zonas
                  </th>
                </tr>
              </thead>
              <tbody>
                {resumo.map((mes) => (
                  <tr key={mes.mes}>
                    <th
                      scope="row"
                      className="border-b border-data-neutral/15 py-1 pr-3 text-left font-normal text-ink-secondary"
                    >
                      {mes.rotulo}
                    </th>
                    <td className="border-b border-data-neutral/15 py-1 pr-3 font-data whitespace-nowrap">
                      {formatarDecimal(mes.nino34, 2)} °C
                    </td>
                    <td className="border-b border-data-neutral/15 py-1 pr-3 font-data whitespace-nowrap">
                      {formatarDecimal(mes.normal, 0)} mm
                    </td>
                    <td className="border-b border-data-neutral/15 py-1 pr-3 font-data whitespace-nowrap">
                      {formatarDecimal(mes.esperado, 0)} mm
                    </td>
                    <td className="border-b border-data-neutral/15 py-1 pr-3 font-data whitespace-nowrap">
                      {formatarComSinal(mes.desvio, 1)}%
                    </td>
                    <td className="border-b border-data-neutral/15 py-1 font-data whitespace-nowrap">
                      {mes.min === null || mes.max === null
                        ? "—"
                        : `${formatarComSinal(mes.min, 0)}% a ${formatarComSinal(mes.max, 0)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
