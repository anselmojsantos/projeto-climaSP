import { useEffect, useState } from "react";
import GraficoSerieHistorica from "./grafico/GraficoSerieHistorica";
import type {
  EstadoSerieHistorica,
  Props,
  RespostaSerieHistorica,
} from "../model/types";

export default function SerieHistorica({ baseApi }: Props) {
  const [estado, setEstado] = useState<EstadoSerieHistorica>({ fase: "carregando" });

  useEffect(() => {
    let cancelado = false;
    (async () => {
      setEstado({ fase: "carregando" });
      try {
        const resposta = await fetch(`${baseApi}/api/enso/serie-historica`);
        if (!resposta.ok) throw new Error(`Backend respondeu com HTTP ${resposta.status}.`);
        const dados = (await resposta.json()) as RespostaSerieHistorica;
        if (cancelado) return;
        setEstado({ fase: "ok", serie: dados.serie ?? [] });
      } catch (erro) {
        if (cancelado) return;
        setEstado({
          fase: "erro",
          mensagem:
            erro instanceof Error
              ? erro.message
              : "Não foi possível carregar a série histórica do RONI.",
        });
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [baseApi]);

  const primeiro = estado.fase === "ok" ? estado.serie[0] : undefined;
  const ultimo =
    estado.fase === "ok" ? estado.serie[estado.serie.length - 1] : undefined;

  return (
    <section aria-labelledby="serie-historica">
      <p className="m-0 mb-1 text-[11px] uppercase tracking-wide text-ink-secondary">
        3 · Histórico
      </p>
      <h2 id="serie-historica" className="m-0 text-[20px] leading-[1.2] font-semibold">
        RONI — série histórica
        {primeiro && ultimo ? ` (${primeiro.ano}–${ultimo.ano})` : ""}
      </h2>
      <p className="mt-1.5 mb-0 text-[15px] leading-[1.3] text-ink-secondary">
        Cada ponto é a média móvel de três meses (trimestre) do RONI, usada para
        identificar os eventos de El Niño e La Niña. A cor indica a fase: El Niño
        (≥ +0,5 °C), La Niña (≤ −0,5 °C) ou neutro.
      </p>

      {estado.fase === "carregando" && (
        <p className="mt-5 mb-0 text-[14px] text-ink-secondary">
          Carregando dados do banco…
        </p>
      )}

      {estado.fase === "erro" && (
        <p role="alert" className="mt-5 mb-0 text-[14px] text-data-warm">
          Não foi possível carregar a série histórica: {estado.mensagem}
        </p>
      )}

      {estado.fase === "ok" && (
        <div className="mt-5">
          <GraficoSerieHistorica serie={estado.serie} />
        </div>
      )}
    </section>
  );
}
