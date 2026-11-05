import { useEffect, useState } from "react";
import GraficoFases from "./grafico/GraficoFases";
import { formatarComSinal } from "../../lib/formato";
import type { EstadoFases, Props, RespostaFases } from "../model/types";

function faixaPercentual(valores: number[]): string {
  const limpos = valores.filter((valor) => Number.isFinite(valor));
  if (limpos.length === 0) return "—";
  const minimo = Math.min(...limpos);
  const maximo = Math.max(...limpos);
  const texto = (valor: number) =>
    Math.abs(valor) < 0.5 ? "0%" : `${formatarComSinal(valor, 0)}%`;
  return Math.round(minimo) === Math.round(maximo)
    ? texto(minimo)
    : `${texto(minimo)} e ${texto(maximo)}`;
}

export default function Fases({ baseApi }: Props) {
  const [estado, setEstado] = useState<EstadoFases>({ fase: "carregando" });

  useEffect(() => {
    let cancelado = false;
    (async () => {
      setEstado({ fase: "carregando" });
      try {
        const resposta = await fetch(`${baseApi}/api/chuvas/fases`);
        if (!resposta.ok) throw new Error(`Backend respondeu com HTTP ${resposta.status}.`);
        const dados = (await resposta.json()) as RespostaFases;
        if (cancelado) return;
        setEstado({
          fase: "ok",
          de: dados.de ?? null,
          ate: dados.ate ?? null,
          zonas: dados.zonas ?? [],
        });
      } catch (erro) {
        if (cancelado) return;
        setEstado({
          fase: "erro",
          mensagem:
            erro instanceof Error
              ? erro.message
              : "Não foi possível carregar a chuva por fase.",
        });
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [baseApi]);

  const periodo =
    estado.fase === "ok" && estado.de !== null && estado.ate !== null
      ? `entre ${estado.de} e ${estado.ate}`
      : "na série histórica";

  const valoresDaFase = (fase: string) =>
    estado.fase === "ok"
      ? estado.zonas.flatMap((zona) =>
          zona.fases
            .filter((item) => item.fase === fase)
            .map((item) => item.anomaliaPct)
            .filter((valor): valor is number => valor !== null),
        )
      : [];

  const textoElNino = faixaPercentual(valoresDaFase("El Niño"));
  const textoNeutro = faixaPercentual(valoresDaFase("Neutro"));
  const textoLaNina = faixaPercentual(valoresDaFase("La Niña"));

  const descricao =
    estado.fase === "ok" && estado.zonas.length > 0
      ? `Cada barra é a diferença média em relação ao mês normal de cada zona. Em meses de El Niño, a chuva fica entre ${textoElNino} em relação à média; em meses neutros, entre ${textoNeutro}; em meses de La Niña, entre ${textoLaNina}. A conta usa todos os meses ${periodo}.`
      : "Cada barra é a diferença média em relação ao mês normal de cada zona, comparando meses de El Niño, neutros e de La Niña na série histórica.";

  return (
    <section aria-labelledby="impactos-fases">
      <p className="m-0 mb-1 text-[11px] uppercase tracking-wide text-ink-secondary">
        1 · Comparação por fase
      </p>
      <h2 id="impactos-fases" className="m-0 text-[20px] leading-[1.2] font-semibold">
        Quando o Pacífico esquenta, chove mais
      </h2>
      <p className="mt-1.5 mb-0 text-[15px] leading-[1.4] text-ink-secondary">
        {descricao}
      </p>

      {estado.fase === "carregando" && (
        <p className="mt-5 mb-0 text-[14px] text-ink-secondary">
          Carregando a série de chuva…
        </p>
      )}

      {estado.fase === "erro" && (
        <p role="alert" className="mt-5 mb-0 text-[14px] text-data-warm">
          Não foi possível carregar a comparação por fase: {estado.mensagem}
        </p>
      )}

      {estado.fase === "ok" && (
        <div className="mt-5">
          <GraficoFases zonas={estado.zonas} de={estado.de} ate={estado.ate} />
        </div>
      )}
    </section>
  );
}
