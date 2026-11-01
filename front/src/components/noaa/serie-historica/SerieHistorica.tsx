import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LIMIARES } from "../model/limiares";
import type {
  EstadoSerieHistorica,
  Props,
  RespostaSerieHistorica,
} from "./model/types";

function corFase(fase: string | null): string {
  if (fase === "El Niño") return "#dc2626";
  if (fase === "La Niña") return "#2563eb";
  return "#6b7280";
}

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

  const dados = useMemo(() => {
    if (estado.fase !== "ok") return [];
    return estado.serie
      .filter((p) => p.roni !== null)
      .map((p) => ({ ...p, x: `${p.temporada}/${String(p.ano).slice(-2)}`, y: p.roni }));
  }, [estado]);

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
        <div className="mt-5 h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(15,23,42,0.08)" />
              <XAxis
                dataKey="x"
                type="category"
                tick={{ fontSize: 10, fill: "var(--color-ink-secondary)" }}
                interval={Math.max(1, Math.floor(dados.length / 12))}
              />
              <YAxis
                dataKey="y"
                type="number"
                domain={[-2.5, 2.5]}
                tick={{ fontSize: 11, fill: "var(--color-ink-secondary)" }}
                tickFormatter={(v) => `${v > 0 ? "+" : ""}${v.toFixed(1)} °C`}
              />
              <ReferenceLine y={LIMIARES.elNino} stroke="#dc2626" strokeDasharray="4 4" />
              <ReferenceLine y={LIMIARES.laNina} stroke="#2563eb" strokeDasharray="4 4" />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid rgba(15,23,42,0.08)" }}
                formatter={(value: number) => [`${value > 0 ? "+" : ""}${value.toFixed(2)} °C`, "RONI"]}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.temporada + "/" + payload?.[0]?.payload?.ano}
              />
              <Scatter data={dados}>
                {dados.map((p, idx) => (
                  <Cell key={idx} fill={corFase(p.fase)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
