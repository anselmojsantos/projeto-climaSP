import { useEffect, useState } from "react";
import GraficoMediaMovel from "./grafico/GraficoMediaMovel";
import type { EstadoRoni, Props, RespostaTemporadas } from "../model/types";

export default function Roni2026({ baseApi }: Props) {
  const [estado, setEstado] = useState<EstadoRoni>({ fase: "carregando" });

  useEffect(() => {
    let cancelado = false;
    (async () => {
      setEstado({ fase: "carregando" });
      try {
        const resposta = await fetch(`${baseApi}/api/enso/temporadas`);
        if (!resposta.ok) throw new Error(`Backend respondeu com HTTP ${resposta.status}.`);
        const dados = (await resposta.json()) as RespostaTemporadas;
        if (cancelado) return;
        setEstado({
          fase: "ok",
          ano: dados.ano ?? null,
          temporadas: dados.temporadas ?? [],
        });
      } catch (erro) {
        if (cancelado) return;
        setEstado({
          fase: "erro",
          mensagem:
            erro instanceof Error
              ? erro.message
              : "Não foi possível carregar o RONI de 2026.",
        });
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [baseApi]);

  const pontos =
    estado.fase === "ok"
      ? estado.temporadas.flatMap((temporada) =>
          temporada.roni !== null
            ? [
                {
                  temporada: temporada.temporada,
                  roni: temporada.roni,
                  fase: temporada.fase,
                  origem: temporada.origem,
                },
              ]
            : [],
        )
      : [];

  return (
    <section aria-labelledby="roni-2026">
      <p className="m-0 mb-1 text-[11px] uppercase tracking-wide text-ink-secondary">
        4 · Índice
      </p>
      <h2 id="roni-2026" className="m-0 text-[20px] leading-[1.2] font-semibold">
        RONI/3.4 — 2026 por temporada
      </h2>
      <p className="mt-1.5 mb-0 text-[15px] leading-[1.3] text-ink-secondary">
        Média móvel de 3 meses do Niño 3.4 em 2026: JFM–ASO observados e SON–NDJ
        projetados por regressão sobre os anos análogos. Os limiares de ±0,5 °C
        separam El Niño, La Niña e Neutro.
      </p>

      {estado.fase === "carregando" && (
        <p className="mt-5 mb-0 text-[14px] text-ink-secondary">
          Carregando dados do banco…
        </p>
      )}

      {estado.fase === "erro" && (
        <p role="alert" className="mt-5 mb-0 text-[14px] text-data-warm">
          Não foi possível carregar o RONI de 2026: {estado.mensagem}
        </p>
      )}

      {estado.fase === "ok" && (
        <div className="mt-5">
          <GraficoMediaMovel pontos={pontos} />
        </div>
      )}
    </section>
  );
}
