import { useEffect, useState } from "react";
import GraficoCaso2026 from "./grafico/GraficoCaso2026";
import { formatarComSinal, formatarDecimal } from "../../lib/formato";
import type { EstadoCaso2026, Props, RespostaCaso2026 } from "../model/types";

export default function Caso2026({ baseApi }: Props) {
  const [estado, setEstado] = useState<EstadoCaso2026>({ fase: "carregando" });

  useEffect(() => {
    let cancelado = false;
    (async () => {
      setEstado({ fase: "carregando" });
      try {
        const resposta = await fetch(`${baseApi}/api/chuvas/caso-2026`);
        if (!resposta.ok) throw new Error(`Backend respondeu com HTTP ${resposta.status}.`);
        const dados = (await resposta.json()) as RespostaCaso2026;
        if (cancelado) return;
        setEstado({
          fase: "ok",
          ano: dados.ano ?? 2026,
          meses: dados.zonas ?? [],
        });
      } catch (erro) {
        if (cancelado) return;
        setEstado({
          fase: "erro",
          mensagem:
            erro instanceof Error
              ? erro.message
              : "Não foi possível carregar o caso de 2026.",
        });
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [baseApi]);

  const ultimoMes =
    estado.fase === "ok"
      ? Math.max(...estado.meses.map((mes) => mes.mesNum), 0)
      : 0;
  const setembro =
    estado.fase === "ok"
      ? estado.meses.filter((mes) => mes.mesNum === ultimoMes)
      : [];

  return (
    <section aria-labelledby="impactos-caso-2026">
      <p className="m-0 mb-1 text-[11px] uppercase tracking-wide text-ink-secondary">
        5 · Caso 2026
      </p>
      <h2
        id="impactos-caso-2026"
        className="m-0 text-[20px] leading-[1.2] font-semibold"
      >
        2026 mostrou o efeito acontecendo
      </h2>
      <p className="mt-1.5 mb-0 text-[15px] leading-[1.4] text-ink-secondary">
        2026 é o teste ao vivo. O Pacífico aqueceu ao longo do ano e, em
        setembro, bateu o recorde da série para o mês: 2,10 °C. No mesmo
        setembro, a chuva em São Paulo ficou de 167% a 177% acima da média e o
        maior dia do mês foi 60% a 85% mais forte. Um ano só não prova a
        relação, mas mostra o mecanismo funcionando.
      </p>

      {estado.fase === "carregando" && (
        <p className="mt-5 mb-0 text-[14px] text-ink-secondary">
          Carregando os dados de 2026…
        </p>
      )}

      {estado.fase === "erro" && (
        <p role="alert" className="mt-5 mb-0 text-[14px] text-data-warm">
          Não foi possível carregar 2026: {estado.mensagem}
        </p>
      )}

      {estado.fase === "ok" && (
        <div className="mt-5 flex flex-col gap-5">
          <GraficoCaso2026 meses={estado.meses} />

          {setembro.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-[14px]">
                <caption className="mb-1 text-left text-[13px] text-ink-secondary">
                  Setembro de {estado.ano}, por zona.
                </caption>
                <thead>
                  <tr className="text-ink-secondary">
                    <th scope="col" className="border-b border-data-neutral/30 py-1 pr-3 font-semibold">
                      Zona
                    </th>
                    <th scope="col" className="border-b border-data-neutral/30 py-1 pr-3 font-semibold">
                      Chuva
                    </th>
                    <th scope="col" className="border-b border-data-neutral/30 py-1 pr-3 font-semibold">
                      Normal
                    </th>
                    <th scope="col" className="border-b border-data-neutral/30 py-1 pr-3 font-semibold">
                      Desvio
                    </th>
                    <th scope="col" className="border-b border-data-neutral/30 py-1 pr-3 font-semibold">
                      Maior dia
                    </th>
                    <th scope="col" className="border-b border-data-neutral/30 py-1 font-semibold">
                      Dias ≥ 25 mm
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
                        {formatarDecimal(mes.chuvaMm)} mm
                      </td>
                      <td className="border-b border-data-neutral/15 py-1 pr-3 font-data whitespace-nowrap">
                        {formatarDecimal(mes.climaMm)} mm
                      </td>
                      <td className="border-b border-data-neutral/15 py-1 pr-3 font-data whitespace-nowrap">
                        {formatarComSinal(mes.anomaliaPct, 0)}%
                      </td>
                      <td className="border-b border-data-neutral/15 py-1 pr-3 font-data whitespace-nowrap">
                        {formatarDecimal(mes.maxDiaMm)} mm
                      </td>
                      <td className="border-b border-data-neutral/15 py-1 font-data whitespace-nowrap">
                        {formatarDecimal(mes.diasGe25, 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="m-0 text-[13px] leading-[1.4] text-data-neutral">
            A linha tracejada é a temperatura do Pacífico (eixo da direita); as
            linhas coloridas são a chuva de cada zona, em % acima ou abaixo da
            média do mês (eixo da esquerda). Em 2026 as duas andaram na mesma
            direção em quase todos os meses — a exceção é julho, seco mesmo com o
            Pacífico aquecendo.
          </p>
        </div>
      )}
    </section>
  );
}
