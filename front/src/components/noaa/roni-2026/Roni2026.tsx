import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LIMIAR_EL_NINO, LIMIAR_LA_NINA } from "../model/limiares";

const LIMIARES = { elNino: LIMIAR_EL_NINO, laNina: LIMIAR_LA_NINA };
import type { EstadoRoni, Props, RespostaTemporadas } from "./model/types";

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

  const dados =
    estado.fase === "ok"
      ? estado.temporadas
          .filter((t) => t.roni !== null)
          .map((t) => ({
            temporada: t.temporada,
            roni: t.roni,
            origem: t.origem,
          }))
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
        <div className="mt-5 h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dados} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(15,23,42,0.08)" />
              <XAxis dataKey="temporada" tick={{ fontSize: 11, fill: "var(--color-ink-secondary)" }} />
              <YAxis
                domain={[-1.5, 2.5]}
                tick={{ fontSize: 11, fill: "var(--color-ink-secondary)" }}
                tickFormatter={(v) => `${v > 0 ? "+" : ""}${v.toFixed(1)} °C`}
              />
              <ReferenceLine y={LIMIARES.elNino} stroke="#dc2626" strokeDasharray="4 4" />
              <ReferenceLine y={LIMIARES.laNina} stroke="#2563eb" strokeDasharray="4 4" />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid rgba(15,23,42,0.08)" }}
                formatter={(value: number) => [`${value > 0 ? "+" : ""}${value.toFixed(2)} °C`, "RONI"]}
              />
              <Line type="monotone" dataKey="roni" stroke="#111827" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
