import { useEffect, useState } from "react";
import GraficoCenario from "./grafico/GraficoCenario";
import { formatarComSinal, formatarDecimal, rotuloMes } from "../../lib/formato";
import type { EstadoCenario, Props, RespostaCenario } from "../model/types";

export default function Cenario({ baseApi }: Props) {
  const [estado, setEstado] = useState<EstadoCenario>({ fase: "carregando" });

  useEffect(() => {
    let cancelado = false;
    (async () => {
      setEstado({ fase: "carregando" });
      try {
        const resposta = await fetch(`${baseApi}/api/chuvas/cenario`);
        if (!resposta.ok) throw new Error(`Backend respondeu com HTTP ${resposta.status}.`);
        const dados = (await resposta.json()) as RespostaCenario;
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
              : "Não foi possível carregar o cenário de 2027.",
        });
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [baseApi]);

  return (
    <section aria-labelledby="impactos-cenario">
      <p className="m-0 mb-1 text-[11px] uppercase tracking-wide text-ink-secondary">
        4 · Projeção
      </p>
      <h2 id="impactos-cenario" className="m-0 text-[20px] leading-[1.2] font-semibold">
        O que esperar de janeiro e fevereiro de 2027
      </h2>
      <p className="mt-1.5 mb-0 text-[15px] leading-[1.4] text-ink-secondary">
        O Pacífico deve chegar a janeiro de 2027 ainda aquecido, em torno de
        2,3 °C acima do normal, e a 2,0 °C em fevereiro. Aplicando essa
        temperatura à relação histórica entre Niño e chuva, a expectativa é de
        chuva de 5% a 8% acima da média em todas as zonas. É pouco — o desvio
        fica entre 9 e 18 mm num mês que chove 170 a 300 mm. A temperatura
        projetada vem do modelo de anos análogos, apresentado em{" "}
        <a
          href="/dados-noaa/#roni-2026"
          className="text-accent underline underline-offset-2"
        >
          Dados NOAA
        </a>
        .
      </p>

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
          <div className="grid gap-4 md:grid-cols-2">
            {estado.meses.map((mes) => (
              <GraficoCenario
                key={mes.mes}
                rotulo={mes.rotulo}
                nino34={mes.nino34Projetado}
                zonas={estado.zonas.filter((zona) => zona.mes === mes.mes)}
              />
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[14px]">
              <caption className="mb-1 text-left text-[13px] text-ink-secondary">
                Chuva normal, chuva esperada e maior dia do mês, por zona.
              </caption>
              <thead>
                <tr className="text-ink-secondary">
                  <th scope="col" className="border-b border-data-neutral/30 py-1 pr-3 font-semibold">
                    Mês
                  </th>
                  <th scope="col" className="border-b border-data-neutral/30 py-1 pr-3 font-semibold">
                    Zona
                  </th>
                  <th scope="col" className="border-b border-data-neutral/30 py-1 pr-3 font-semibold">
                    Normal
                  </th>
                  <th scope="col" className="border-b border-data-neutral/30 py-1 pr-3 font-semibold">
                    Esperado
                  </th>
                  <th scope="col" className="border-b border-data-neutral/30 py-1 pr-3 font-semibold">
                    Desvio
                  </th>
                  <th scope="col" className="border-b border-data-neutral/30 py-1 font-semibold">
                    Maior dia
                  </th>
                </tr>
              </thead>
              <tbody>
                {estado.zonas.map((zona) => (
                  <tr key={`${zona.zona}-${zona.mes}`}>
                    <th
                      scope="row"
                      className="border-b border-data-neutral/15 py-1 pr-3 text-left font-normal text-ink-secondary"
                    >
                      {`${rotuloMes(zona.mesNum)}/${zona.ano}`}
                    </th>
                    <td className="border-b border-data-neutral/15 py-1 pr-3">
                      {zona.zona}
                    </td>
                    <td className="border-b border-data-neutral/15 py-1 pr-3 font-data whitespace-nowrap">
                      {formatarDecimal(zona.chuvaNormalMm)} mm
                    </td>
                    <td className="border-b border-data-neutral/15 py-1 pr-3 font-data whitespace-nowrap">
                      {formatarDecimal(zona.chuvaEsperadaMm)} mm
                    </td>
                    <td className="border-b border-data-neutral/15 py-1 pr-3 font-data whitespace-nowrap">
                      {formatarComSinal(zona.desvioMm)} mm
                    </td>
                    <td className="border-b border-data-neutral/15 py-1 font-data whitespace-nowrap">
                      {formatarDecimal(zona.maiorDiaEsperadoMm)} mm
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="m-0 text-[13px] leading-[1.4] text-data-neutral">
            O desvio projetado cabe dentro do erro típico do modelo, de cerca de
            54 mm. A leitura correta é "tendência de chuva acima da média", não
            "vai chover exatamente 16 mm a mais".
          </p>
        </div>
      )}
    </section>
  );
}
