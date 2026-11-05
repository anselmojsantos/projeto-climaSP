import { useEffect, useState } from "react";
import GraficoFases from "./grafico/GraficoFases";
import {
  formatarComSinal,
  formatarDecimal,
  rotuloMesLongo,
} from "../../lib/formato";
import type { EstadoFases, Props, RespostaFases } from "../model/types";

function valorDaFase(fases: EstadoFases, nome: string): number | null {
  if (fases.fase !== "ok") return null;
  return fases.fases.find((fase) => fase.fase === nome)?.anomaliaPct ?? null;
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
          primeiroMes: dados.primeiroMes ?? null,
          ultimoMes: dados.ultimoMes ?? null,
          mesesPorZona: dados.mesesPorZona ?? null,
          fases: dados.fases ?? [],
        });
      } catch (erro) {
        if (cancelado) return;
        setEstado({
          fase: "erro",
          mensagem:
            erro instanceof Error
              ? erro.message
              : "Não foi possível carregar a comparação por fase.",
        });
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [baseApi]);

  const elNino = valorDaFase(estado, "El Niño");
  const neutro = valorDaFase(estado, "Neutro");
  const laNina = valorDaFase(estado, "La Niña");
  const faseElNino =
    estado.fase === "ok"
      ? estado.fases.find((fase) => fase.fase === "El Niño")
      : undefined;

  const periodo =
    estado.fase === "ok" && estado.primeiroMes && estado.ultimoMes
      ? `de ${rotuloMesLongo(estado.primeiroMes)} a ${rotuloMesLongo(estado.ultimoMes)}`
      : "no período analisado";
  const meses =
    estado.fase === "ok" && estado.mesesPorZona
      ? `${estado.mesesPorZona} meses em cada zona`
      : "";

  return (
    <section
      aria-labelledby="impactos-fases"
      className="border-t border-data-neutral/15 pt-10"
    >
      <p className="m-0 mb-1 text-[11px] uppercase tracking-wide text-ink-secondary">
        2 · Comparação por fase
      </p>
      <h2 id="impactos-fases" className="m-0 text-[21px] leading-[1.2] font-semibold">
        Quando o Pacífico esquenta, chove mais
      </h2>

      <div className="mt-2 flex max-w-[820px] flex-col gap-2 text-[15px] leading-[1.5] text-ink-secondary">
        <p className="m-0">
          Para comparar, separamos os meses em três grupos pela temperatura do
          Pacífico: El Niño (+0,5 °C ou mais), Neutro (entre −0,5 e +0,5 °C) e
          La Niña (−0,5 °C ou menos).
        </p>
        <p className="m-0">
          {estado.fase === "ok" ? (
            <>
              Em média, os meses de El Niño tiveram{" "}
              {elNino === null ? "—" : `${formatarDecimal(Math.abs(elNino), 0)}%`}{" "}
              mais chuva que a normal do mesmo mês. Os meses neutros tiveram{" "}
              {neutro === null ? "—" : `${formatarDecimal(Math.abs(neutro), 0)}%`}{" "}
              mais. Os meses de La Niña ficaram{" "}
              {laNina === null ? "—" : `${formatarDecimal(Math.abs(laNina), 0)}%`}{" "}
              abaixo. Nas cinco zonas, o valor de El Niño fica entre{" "}
              {faseElNino?.min === null || faseElNino?.min === undefined
                ? "—"
                : `${formatarComSinal(faseElNino.min, 0)}%`}{" "}
              e{" "}
              {faseElNino?.max === null || faseElNino?.max === undefined
                ? "—"
                : `${formatarComSinal(faseElNino.max, 0)}%`}.
            </>
          ) : (
            "Separamos os meses pela temperatura do Pacífico para comparar a chuva."
          )}
        </p>
        <p className="m-0">
          A normal é a média de cada mês entre 1991 e 2020. O período vai{" "}
          {periodo}
          {meses ? `: ${meses}` : ""}.
        </p>
      </div>

      {estado.fase === "carregando" && (
        <p className="mt-5 mb-0 text-[14px] text-ink-secondary">
          Carregando a comparação…
        </p>
      )}

      {estado.fase === "erro" && (
        <p role="alert" className="mt-5 mb-0 text-[14px] text-data-warm">
          Não foi possível carregar a comparação: {estado.mensagem}
        </p>
      )}

      {estado.fase === "ok" && (
        <div className="mt-5">
          <GraficoFases fases={estado.fases} />
        </div>
      )}
    </section>
  );
}
