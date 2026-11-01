import { useEffect, useState } from "react";
import GraficoAnalogos from "./grafico/GraficoAnalogos";
import type { EstadoAnalogos, Props, RespostaAnalogos } from "../model/types";

export default function Analogos2026({ baseApi }: Props) {
  const [estado, setEstado] = useState<EstadoAnalogos>({ fase: "carregando" });

  useEffect(() => {
    let cancelado = false;
    (async () => {
      setEstado({ fase: "carregando" });
      try {
        const resposta = await fetch(`${baseApi}/api/enso/analogos`);
        if (!resposta.ok) throw new Error(`Backend respondeu com HTTP ${resposta.status}.`);
        const dados = (await resposta.json()) as RespostaAnalogos;
        if (cancelado) return;
        setEstado({
          fase: "ok",
          temporadas: dados.temporadas ?? [],
          alvo: dados.alvo ?? [],
          media: dados.media ?? [],
          candidatos: dados.candidatos ?? null,
          analogos: dados.analogos ?? [],
        });
      } catch (erro) {
        if (cancelado) return;
        setEstado({
          fase: "erro",
          mensagem:
            erro instanceof Error
              ? erro.message
              : "Não foi possível carregar os análogos de 2026.",
        });
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [baseApi]);

  const totalAnalogos = estado.fase === "ok" ? estado.analogos.length : null;

  return (
    <section aria-labelledby="analogos-2026">
      <p className="m-0 mb-1 text-[11px] uppercase tracking-wide text-ink-secondary">
        2 · Método
      </p>
      <h2 id="analogos-2026" className="m-0 text-[20px] leading-[1.2] font-semibold">
        Análogos históricos de 2026
      </h2>
      <p className="mt-1.5 mb-0 text-[15px] leading-[1.3] text-ink-secondary">
        {totalAnalogos ? `${totalAnalogos} anos` : "Os anos"} cuja curva JFM–ASO mais se
        aproxima da de 2026, comparados entre si, com a média dos análogos e o alvo 2026.
      </p>

      {estado.fase === "carregando" && (
        <p className="mt-5 mb-0 text-[14px] text-ink-secondary">
          Carregando dados do banco…
        </p>
      )}

      {estado.fase === "erro" && (
        <p role="alert" className="mt-5 mb-0 text-[14px] text-data-warm">
          Não foi possível carregar os análogos de 2026: {estado.mensagem}
        </p>
      )}

      {estado.fase === "ok" && (
        <div className="mt-5">
          <GraficoAnalogos
            temporadas={estado.temporadas}
            alvo={estado.alvo}
            media={estado.media}
            candidatos={estado.candidatos}
            analogos={estado.analogos}
          />
        </div>
      )}
    </section>
  );
}
