import { useEffect, useState } from "react";
import GraficoSerie from "./grafico/GraficoSerie";
import {
  formatarDecimal,
  formatarMm,
  formatarPercentualSinal,
} from "../../lib/formato";
import type {
  EstadoHistorico,
  Props,
  RespostaCaso2026,
  RespostaSerie,
} from "../model/types";

export default function Historico({ baseApi }: Props) {
  const [estado, setEstado] = useState<EstadoHistorico>({ fase: "carregando" });

  useEffect(() => {
    let cancelado = false;
    (async () => {
      setEstado({ fase: "carregando" });
      try {
        const [respostaSerie, respostaCaso] = await Promise.all([
          fetch(`${baseApi}/api/chuvas/serie`),
          fetch(`${baseApi}/api/chuvas/caso-2026`),
        ]);
        if (!respostaSerie.ok) {
          throw new Error(`Backend respondeu com HTTP ${respostaSerie.status}.`);
        }
        if (!respostaCaso.ok) {
          throw new Error(`Backend respondeu com HTTP ${respostaCaso.status}.`);
        }

        const [serie, caso] = (await Promise.all([
          respostaSerie.json(),
          respostaCaso.json(),
        ])) as [RespostaSerie, RespostaCaso2026];

        if (cancelado) return;
        setEstado({
          fase: "ok",
          de: serie.de ?? null,
          ate: serie.ate ?? null,
          pontos: serie.pontos ?? [],
          periodos: serie.periodos ?? [],
          setembro: (caso.zonas ?? []).filter((mes) => mes.mesNum === 9),
          ano: caso.ano ?? 2026,
        });
      } catch (erro) {
        if (cancelado) return;
        setEstado({
          fase: "erro",
          mensagem:
            erro instanceof Error
              ? erro.message
              : "Não foi possível carregar a série de chuva.",
        });
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [baseApi]);

  const setembro = estado.fase === "ok" ? estado.setembro : [];
  const nino =
    setembro
      .map((mes) => mes.nino34)
      .find((valor): valor is number => valor !== null) ?? null;

  const desvios = setembro
    .map((mes) => mes.anomaliaPct)
    .filter((valor): valor is number => valor !== null);
  const desvioMin = desvios.length > 0 ? Math.min(...desvios) : null;
  const desvioMax = desvios.length > 0 ? Math.max(...desvios) : null;

  const maxDiaPcts = setembro
    .map((mes) =>
      mes.maxDiaMm !== null && mes.climaMaxDiaMm !== null && mes.climaMaxDiaMm > 0
        ? (mes.maxDiaMm / mes.climaMaxDiaMm - 1) * 100
        : null,
    )
    .filter((valor): valor is number => valor !== null);
  const maxDiaMin = maxDiaPcts.length > 0 ? Math.min(...maxDiaPcts) : null;
  const maxDiaMax = maxDiaPcts.length > 0 ? Math.max(...maxDiaPcts) : null;

  return (
    <section
      aria-labelledby="impactos-historico"
      className="border-t border-data-neutral/15 pt-10"
    >
      <p className="m-0 mb-1 text-[11px] uppercase tracking-wide text-ink-secondary">
        1 · O que os dados mostram
      </p>
      <h2
        id="impactos-historico"
        className="m-0 text-[21px] leading-[1.2] font-semibold"
      >
        A chuva e o Pacífico, de 1961 a 2026
      </h2>

      <div className="mt-2 flex max-w-[820px] flex-col gap-2 text-[15px] leading-[1.5] text-ink-secondary">
        <p className="m-0">
          O gráfico tem duas linhas. A laranja é a temperatura do Pacífico. A
          azul é a chuva nas cinco zonas: quantos por cento acima ou abaixo da
          normal do mesmo mês. Cada ponto é a média dos 12 meses anteriores, o
          que tira o sobe e desce de curto prazo.
        </p>
        <p className="m-0">
          As faixas vermelhas são os períodos de El Niño. As duas linhas sobem
          juntas em vários momentos, mas não sempre. O Niño é um dos fatores que
          mexem na chuva, não o único.
        </p>
        <p className="m-0">
          O gráfico usa médias de 12 meses, então o pico de setembro de 2026
          aparece suavizado. O valor daquele mês, sozinho, está no quadro
          abaixo.
        </p>
      </div>

      {estado.fase === "carregando" && (
        <p className="mt-5 mb-0 text-[14px] text-ink-secondary">
          Carregando a série de chuva…
        </p>
      )}

      {estado.fase === "erro" && (
        <p role="alert" className="mt-5 mb-0 text-[14px] text-data-warm">
          Não foi possível carregar a série: {estado.mensagem}
        </p>
      )}

      {estado.fase === "ok" && (
        <div className="mt-5 flex flex-col gap-6">
          <GraficoSerie pontos={estado.pontos} periodos={estado.periodos} />

          {setembro.length > 0 && (
            <div className="rounded-2xl border border-data-warm/30 bg-data-warm/5 p-4">
              <p className="m-0 text-[11px] uppercase tracking-wide text-data-warm">
                Setembro de {estado.ano}
              </p>
              <p className="mt-1 mb-0 text-[15px] leading-[1.5]">
                O Pacífico chegou a{" "}
                {nino === null ? "—" : `${formatarDecimal(nino, 2)} °C`}, o maior
                valor para setembro desde 1961. A chuva ficou entre{" "}
                {desvioMin === null ? "—" : `${formatarDecimal(desvioMin, 0)}%`}{" "}
                e{" "}
                {desvioMax === null ? "—" : `${formatarDecimal(desvioMax, 0)}%`}{" "}
                acima da normal nas cinco zonas, e o dia mais chuvoso foi{" "}
                {maxDiaMin === null ? "—" : `${formatarDecimal(maxDiaMin, 0)}%`}{" "}
                a{" "}
                {maxDiaMax === null ? "—" : `${formatarDecimal(maxDiaMax, 0)}%`}{" "}
                mais forte.
              </p>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full border-collapse text-left text-[13px]">
                  <caption className="mb-1 text-left text-[13px] text-ink-secondary">
                    Setembro de {estado.ano}, por zona.
                  </caption>
                  <thead>
                    <tr className="text-ink-secondary">
                      <th
                        scope="col"
                        className="border-b border-data-neutral/30 py-1 pr-3 font-semibold"
                      >
                        Zona
                      </th>
                      <th
                        scope="col"
                        className="border-b border-data-neutral/30 py-1 pr-3 font-semibold"
                      >
                        Chuva
                      </th>
                      <th
                        scope="col"
                        className="border-b border-data-neutral/30 py-1 pr-3 font-semibold"
                      >
                        Normal
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
                        Maior dia
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {setembro.map((mes) => (
                      <tr key={mes.zona}>
                        <th
                          scope="row"
                          className="border-b border-data-neutral/15 py-1 pr-3 text-left font-normal text-ink-secondary"
                        >
                          {mes.zona}
                        </th>
                        <td className="border-b border-data-neutral/15 py-1 pr-3 font-data whitespace-nowrap">
                          {formatarMm(mes.chuvaMm, 0)}
                        </td>
                        <td className="border-b border-data-neutral/15 py-1 pr-3 font-data whitespace-nowrap">
                          {formatarMm(mes.climaMm, 0)}
                        </td>
                        <td className="border-b border-data-neutral/15 py-1 pr-3 font-data whitespace-nowrap">
                          {formatarPercentualSinal(mes.anomaliaPct, 0)}
                        </td>
                        <td className="border-b border-data-neutral/15 py-1 font-data whitespace-nowrap">
                          {formatarMm(mes.maxDiaMm, 1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
