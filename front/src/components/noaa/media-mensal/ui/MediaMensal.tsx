import { useEffect, useState } from "react";
import GraficoMediaMensal from "./grafico/GraficoMediaMensal";
import type {
  EstadoMediaMensal,
  Props,
  RespostaMediaMensal,
} from "../model/types";

export default function MediaMensal({ baseApi }: Props) {
  const [estado, setEstado] = useState<EstadoMediaMensal>({ fase: "carregando" });

  useEffect(() => {
    let cancelado = false;
    (async () => {
      setEstado({ fase: "carregando" });
      try {
        const resposta = await fetch(`${baseApi}/api/anomalias/media-mensal`);
        if (!resposta.ok) throw new Error(`Backend respondeu com HTTP ${resposta.status}.`);
        const dados = (await resposta.json()) as RespostaMediaMensal;
        if (cancelado) return;
        setEstado({
          fase: "ok",
          ano: dados.ano ?? 2026,
          regioes: dados.regioes ?? [],
          serie: dados.serie ?? [],
        });
      } catch (erro) {
        if (cancelado) return;
        setEstado({
          fase: "erro",
          mensagem:
            erro instanceof Error
              ? erro.message
              : "Não foi possível carregar as médias mensais.",
        });
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [baseApi]);

  return (
    <section aria-labelledby="media-mensal">
      <p className="m-0 mb-1 text-[11px] uppercase tracking-wide text-ink-secondary">
        1 · Contexto
      </p>
      <h2 id="media-mensal" className="m-0 text-[20px] leading-[1.2] font-semibold">
        Evolução mensal das anomalias por região
      </h2>
      <p className="mt-1.5 mb-0 text-[15px] leading-[1.3] text-ink-secondary">
        Média mensal da anomalia de TSM nas quatro regiões Niño, do início ao fim do
        período observado.
      </p>

      {estado.fase === "carregando" && (
        <p className="mt-5 mb-0 text-[14px] text-ink-secondary">
          Carregando dados do banco…
        </p>
      )}

      {estado.fase === "erro" && (
        <p role="alert" className="mt-5 mb-0 text-[14px] text-data-warm">
          Não foi possível carregar as médias mensais: {estado.mensagem}
        </p>
      )}

      {estado.fase === "ok" && (
        <div className="mt-5">
          <GraficoMediaMensal
            ano={estado.ano}
            regioes={estado.regioes}
            serie={estado.serie}
          />
        </div>
      )}
    </section>
  );
}
