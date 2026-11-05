import { useEffect, useState } from "react";
import GraficoIntensidade from "./grafico/GraficoIntensidade";
import { formatarDecimal } from "../../lib/formato";
import type {
  EstadoIntensidade,
  Props,
  RespostaIntensidade,
  ZonaIntensidade,
} from "../model/types";

function fatorDeDias(zona: ZonaIntensidade): { fator: number | null; p: number | null } {
  const metrica = zona.metricas.find((item) => item.chave === "dias_ge_25");
  return { fator: metrica?.fator ?? null, p: metrica?.p ?? null };
}

function faixaDeDias(zonas: ZonaIntensidade[]): string {
  const valores = zonas
    .map((zona) => fatorDeDias(zona).fator)
    .filter((valor): valor is number => valor !== null)
    .map((fator) => (fator - 1) * 100);
  if (valores.length === 0) return "—";
  return `${formatarDecimal(Math.min(...valores), 0)}% a ${formatarDecimal(Math.max(...valores), 0)}%`;
}

export default function Intensidade({ baseApi }: Props) {
  const [estado, setEstado] = useState<EstadoIntensidade>({ fase: "carregando" });

  useEffect(() => {
    let cancelado = false;
    (async () => {
      setEstado({ fase: "carregando" });
      try {
        const resposta = await fetch(`${baseApi}/api/chuvas/intensidade`);
        if (!resposta.ok) throw new Error(`Backend respondeu com HTTP ${resposta.status}.`);
        const dados = (await resposta.json()) as RespostaIntensidade;
        if (cancelado) return;
        setEstado({ fase: "ok", zonas: dados.zonas ?? [] });
      } catch (erro) {
        if (cancelado) return;
        setEstado({
          fase: "erro",
          mensagem:
            erro instanceof Error
              ? erro.message
              : "Não foi possível carregar a intensidade da chuva.",
        });
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [baseApi]);

  return (
    <section aria-labelledby="impactos-intensidade">
      <p className="m-0 mb-1 text-[11px] uppercase tracking-wide text-ink-secondary">
        2 · Intensidade
      </p>
      <h2
        id="impactos-intensidade"
        className="m-0 text-[20px] leading-[1.2] font-semibold"
      >
        A chuva forte cresce mais que o volume
      </h2>
      <p className="mt-1.5 mb-0 text-[15px] leading-[1.4] text-ink-secondary">
        Para cada 1 °C de aquecimento do Pacífico, a chuva do mês cresce de 4% a
        6%. O maior dia do mês cresce mais: de 5% a 9%. É a diferença entre
        chover mais vezes fraco e chover tudo de uma vez — e é a segunda que
        alaga.
      </p>

      {estado.fase === "carregando" && (
        <p className="mt-5 mb-0 text-[14px] text-ink-secondary">
          Carregando o efeito por grau…
        </p>
      )}

      {estado.fase === "erro" && (
        <p role="alert" className="mt-5 mb-0 text-[14px] text-data-warm">
          Não foi possível carregar a intensidade: {estado.mensagem}
        </p>
      )}

      {estado.fase === "ok" && (
        <div className="mt-5 flex flex-col gap-5">
          <GraficoIntensidade zonas={estado.zonas} />

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[14px]">
              <caption className="mb-1 text-left text-[13px] text-ink-secondary">
                Dias com chuva acima de 25 mm: quantas vezes o número de dias
                cresce por 1 °C.
              </caption>
              <thead>
                <tr className="text-ink-secondary">
                  <th scope="col" className="border-b border-data-neutral/30 py-1 pr-3 font-semibold">
                    Zona
                  </th>
                  <th scope="col" className="border-b border-data-neutral/30 py-1 pr-3 font-semibold">
                    Vezes por °C
                  </th>
                  <th scope="col" className="border-b border-data-neutral/30 py-1 font-semibold">
                    Confiança (p)
                  </th>
                </tr>
              </thead>
              <tbody>
                {estado.zonas.map((zona) => {
                  const { fator, p } = fatorDeDias(zona);
                  return (
                    <tr key={zona.zona}>
                      <th
                        scope="row"
                        className="border-b border-data-neutral/15 py-1 pr-3 text-left font-normal text-ink-secondary"
                      >
                        {zona.zona}
                      </th>
                      <td className="border-b border-data-neutral/15 py-1 pr-3 font-data whitespace-nowrap">
                        {fator === null ? "—" : `${formatarDecimal(fator, 2)}×`}
                      </td>
                      <td className="border-b border-data-neutral/15 py-1 font-data whitespace-nowrap">
                        {p === null ? "—" : formatarDecimal(p, 3)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="m-0 text-[13px] leading-[1.4] text-data-neutral">
            Leitura: em meses de El Niño, a chance de um dia de chuva forte
            (&gt;25 mm) aumenta de{" "}
            {faixaDeDias(estado.fase === "ok" ? estado.zonas : [])} por grau. O p
            abaixo de 0,05 indica efeito que a amostra sustenta; acima disso, o
            número existe mas ainda pode ser acaso.
          </p>
        </div>
      )}
    </section>
  );
}
