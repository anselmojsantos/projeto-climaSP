import { useEffect, useState } from "react";
import GraficoConcentracao from "./grafico/GraficoConcentracao";
import { formatarComSinal } from "../../lib/formato";
import type {
  EstadoConcentracao,
  Props,
  RespostaConcentracao,
} from "../model/types";

export default function Concentracao({ baseApi }: Props) {
  const [estado, setEstado] = useState<EstadoConcentracao>({ fase: "carregando" });

  useEffect(() => {
    let cancelado = false;
    (async () => {
      setEstado({ fase: "carregando" });
      try {
        const resposta = await fetch(`${baseApi}/api/chuvas/concentracao`);
        if (!resposta.ok) throw new Error(`Backend respondeu com HTTP ${resposta.status}.`);
        const dados = (await resposta.json()) as RespostaConcentracao;
        if (cancelado) return;
        setEstado({ fase: "ok", zonas: dados.zonas ?? [] });
      } catch (erro) {
        if (cancelado) return;
        setEstado({
          fase: "erro",
          mensagem:
            erro instanceof Error
              ? erro.message
              : "Não foi possível carregar a concentração da chuva.",
        });
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [baseApi]);

  const significativas =
    estado.fase === "ok"
      ? estado.zonas.filter((zona) => zona.significativo).length
      : 0;

  return (
    <section aria-labelledby="impactos-concentracao">
      <p className="m-0 mb-1 text-[11px] uppercase tracking-wide text-ink-secondary">
        3 · Concentração
      </p>
      <h2
        id="impactos-concentracao"
        className="m-0 text-[20px] leading-[1.2] font-semibold"
      >
        A diferença entre o total e a pancada
      </h2>
      <p className="mt-1.5 mb-0 text-[15px] leading-[1.4] text-ink-secondary">
        Se o maior dia do mês cresce mais que o total, a chuva está se
        concentrando. A barra abaixo é essa diferença, em pontos percentuais. Em
        quatro das cinco zonas ela é positiva — de +2,4 a +3,0 p.p. —, mas a
        margem de erro ainda cruza o zero em todas. Ou seja: a direção aparece,
        mas o estudo não pode afirmar que a concentração aumentou.
      </p>

      {estado.fase === "carregando" && (
        <p className="mt-5 mb-0 text-[14px] text-ink-secondary">
          Carregando a comparação…
        </p>
      )}

      {estado.fase === "erro" && (
        <p role="alert" className="mt-5 mb-0 text-[14px] text-data-warm">
          Não foi possível carregar a concentração: {estado.mensagem}
        </p>
      )}

      {estado.fase === "ok" && (
        <div className="mt-5 flex flex-col gap-4">
          <GraficoConcentracao zonas={estado.zonas} />

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[14px]">
              <caption className="mb-1 text-left text-[13px] text-ink-secondary">
                Crescimento por °C de cada medida, e a diferença entre elas.
              </caption>
              <thead>
                <tr className="text-ink-secondary">
                  <th scope="col" className="border-b border-data-neutral/30 py-1 pr-3 font-semibold">
                    Zona
                  </th>
                  <th scope="col" className="border-b border-data-neutral/30 py-1 pr-3 font-semibold">
                    Total
                  </th>
                  <th scope="col" className="border-b border-data-neutral/30 py-1 pr-3 font-semibold">
                    Maior dia
                  </th>
                  <th scope="col" className="border-b border-data-neutral/30 py-1 font-semibold">
                    Diferença
                  </th>
                </tr>
              </thead>
              <tbody>
                {estado.zonas.map((zona) => (
                  <tr key={zona.zona}>
                    <th
                      scope="row"
                      className="border-b border-data-neutral/15 py-1 pr-3 text-left font-normal text-ink-secondary"
                    >
                      {zona.zona}
                    </th>
                    <td className="border-b border-data-neutral/15 py-1 pr-3 font-data whitespace-nowrap">
                      {formatarComSinal(zona.pctTotal)}%
                    </td>
                    <td className="border-b border-data-neutral/15 py-1 pr-3 font-data whitespace-nowrap">
                      {formatarComSinal(zona.pctMaxDia)}%
                    </td>
                    <td className="border-b border-data-neutral/15 py-1 font-data whitespace-nowrap">
                      {formatarComSinal(zona.deltaPP)} p.p.
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="m-0 text-[13px] leading-[1.4] text-data-neutral">
            {significativas === 0
              ? "Nenhuma zona tem diferença estatisticamente significativa. É por isso que o texto fala em direção do efeito, não em prova."
              : `${significativas} de ${estado.zonas.length} zonas têm diferença estatisticamente significativa.`}
          </p>
        </div>
      )}
    </section>
  );
}
