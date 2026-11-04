import { useEffect, useState } from "react";
import GraficoMediaMovel from "./grafico/GraficoMediaMovel";
import { formatoIntervalo } from "../model/rotulos";
import type {
  EstadoRoni,
  PontoRoni,
  Props,
  RespostaTemporadas,
} from "../model/types";

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

  const pontos: PontoRoni[] =
    estado.fase === "ok"
      ? estado.temporadas.flatMap((temporada) =>
          temporada.roni !== null
            ? [
                {
                  temporada: temporada.temporada,
                  ano: temporada.ano,
                  roni: temporada.roni,
                  fase: temporada.fase,
                  origem: temporada.origem,
                },
              ]
            : [],
        )
      : [];

  const observados = pontos.filter((ponto) => ponto.origem !== "Previsto");
  const previstos = pontos.filter((ponto) => ponto.origem === "Previsto");
  const anos = [
    ...new Set(
      pontos
        .map((ponto) => ponto.ano)
        .filter((ano): ano is number => ano !== null),
    ),
  ];
  const tituloAnos =
    anos.length > 1 ? `${anos[0]}–${anos[anos.length - 1]}` : (anos[0] ?? "");

  const descricao =
    observados.length > 0
      ? `Média móvel de 3 meses do Niño 3.4. As temporadas de ${formatoIntervalo(observados)} são observadas` +
        (previstos.length > 0
          ? `; as de ${formatoIntervalo(previstos)} são projetadas por regressão linear treinada nos anos análogos. Para cada temporada futura, a reta aprende nesses anos como o RONI de ASO se relaciona com o que veio depois e aplica essa relação ao ASO observado de 2026.`
          : ".") +
        " Os limiares de ±0,5 °C separam El Niño, La Niña e Neutro."
      : "Média móvel de 3 meses do Niño 3.4 por temporada. Os limiares de ±0,5 °C separam El Niño, La Niña e Neutro.";

  return (
    <section aria-labelledby="roni-2026">
      <p className="m-0 mb-1 text-[11px] uppercase tracking-wide text-ink-secondary">
        4 · Índice
      </p>
      <h2 id="roni-2026" className="m-0 text-[20px] leading-[1.2] font-semibold">
        RONI/3.4 — {tituloAnos || "série"} por temporada
      </h2>
      <p className="mt-1.5 mb-0 text-[15px] leading-[1.3] text-ink-secondary">
        {descricao}
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
