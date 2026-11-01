import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PALETA } from "./model/paleta";
import type { EstadoAnalogos, Props, RespostaAnalogos } from "./model/types";

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

  const dadosGrafico =
    estado.fase === "ok"
      ? estado.temporadas.map((temporada, idx) => {
          const linha: Record<string, number | null | string> = { temporada };
          linha["Alvo 2026"] = estado.alvo[idx] ?? null;
          linha["Média análogos"] = estado.media[idx] ?? null;
          estado.analogos.forEach((analogo) => {
            if (analogo.ano === null) return;
            linha[String(analogo.ano)] = analogo.valores[idx] ?? null;
          });
          return linha;
        })
      : [];

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
        <div className="mt-5 h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dadosGrafico} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(15,23,42,0.08)" />
              <XAxis dataKey="temporada" tick={{ fontSize: 11, fill: "var(--color-ink-secondary)" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-ink-secondary)" }}
                tickFormatter={(v) => `${v > 0 ? "+" : ""}${v.toFixed(1)} °C`}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid rgba(15,23,42,0.08)" }}
                formatter={(value: number) => [`${value > 0 ? "+" : ""}${value.toFixed(2)} °C`, ""]}
              />
              <Line type="monotone" dataKey="Alvo 2026" stroke="#111827" strokeWidth={2.5} dot={false} />
              <Line
                type="monotone"
                dataKey="Média análogos"
                stroke="#dc2626"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
              />
              {estado.analogos.map((analogo, idx) => (
                <Line
                  key={analogo.ano ?? idx}
                  type="monotone"
                  dataKey={String(analogo.ano)}
                  stroke={PALETA[idx % PALETA.length]}
                  strokeWidth={1.6}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
