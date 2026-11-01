import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ajustarReta } from "./lib/regressao";
import type {
  EstadoValidacao,
  PontoValidacao,
  Props,
  RespostaValidacao,
  SerieValidacao,
} from "./model/types";

export default function Validacao2026({ baseApi }: Props) {
  const [estado, setEstado] = useState<EstadoValidacao>({ fase: "carregando" });

  useEffect(() => {
    let cancelado = false;
    (async () => {
      setEstado({ fase: "carregando" });
      try {
        const resposta = await fetch(`${baseApi}/api/enso/analogos`);
        if (!resposta.ok) throw new Error(`Backend respondeu com HTTP ${resposta.status}.`);
        const dados = (await resposta.json()) as RespostaValidacao;
        if (cancelado) return;
        setEstado({
          fase: "ok",
          temporadas: dados.temporadas ?? [],
          temporadasFuturo: dados.temporadasFuturo ?? [],
          alvoFuturo: dados.alvoFuturo ?? [],
          aso2026: dados.aso2026 ?? null,
          analogos: dados.analogos ?? [],
        });
      } catch (erro) {
        if (cancelado) return;
        setEstado({
          fase: "erro",
          mensagem:
            erro instanceof Error
              ? erro.message
              : "Não foi possível carregar a validação do modelo.",
        });
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [baseApi]);

  const iAso = estado.fase === "ok" ? estado.temporadas.indexOf("ASO") : -1;

  const series: SerieValidacao[] = [];
  if (estado.fase === "ok" && iAso >= 0) {
    estado.temporadasFuturo.forEach((temporada, indiceFuturo) => {
      const pontos: PontoValidacao[] = [];
      estado.analogos.forEach((analogo, indice) => {
        const aso = analogo.valores[iAso];
        const valor = analogo.futuro[indiceFuturo];
        if (analogo.ano === null || aso == null || valor == null) return;
        pontos.push({ ano: analogo.ano, aso, valor, indice });
      });

      const reta = ajustarReta(pontos.map((ponto) => ({ x: ponto.aso, y: ponto.valor })));
      if (!reta) return;

      const alvo = estado.alvoFuturo[indiceFuturo];
      series.push({
        temporada,
        pontos,
        reta,
        alvo2026: typeof alvo === "number" ? alvo : null,
      });
    });
  }

  return (
    <section aria-labelledby="validacao-2026">
      <p className="m-0 mb-1 text-[11px] uppercase tracking-wide text-ink-secondary">
        5 · Validação
      </p>
      <h2 id="validacao-2026" className="m-0 text-[20px] leading-[1.2] font-semibold">
        Validação da reta de projeção
      </h2>
      <p className="mt-1.5 mb-0 text-[15px] leading-[1.3] text-ink-secondary">
        O ajuste da regressão em três horizontes — de SON a NDJ.
      </p>

      {estado.fase === "carregando" && (
        <p className="mt-5 mb-0 text-[14px] text-ink-secondary">
          Carregando dados do banco…
        </p>
      )}

      {estado.fase === "erro" && (
        <p role="alert" className="mt-5 mb-0 text-[14px] text-data-warm">
          Não foi possível carregar a validação do modelo: {estado.mensagem}
        </p>
      )}

      {estado.fase === "ok" && series.length === 0 && (
        <p className="mt-5 mb-0 text-[14px] text-ink-secondary">
          Sem pontos suficientes para validar a reta.
        </p>
      )}

      {estado.fase === "ok" && series.length > 0 && (
        <div className="mt-5 space-y-6">
          {series.map((serie) => {
            const retaDados = [
              { x: Math.min(...serie.pontos.map((p) => p.aso)), y: serie.reta.a * Math.min(...serie.pontos.map((p) => p.aso)) + serie.reta.b },
              { x: Math.max(...serie.pontos.map((p) => p.aso)), y: serie.reta.a * Math.max(...serie.pontos.map((p) => p.aso)) + serie.reta.b },
            ];
            return (
              <div key={serie.temporada}>
                <p className="mb-2 text-[13px] font-semibold text-ink">{serie.temporada}</p>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="4 4" stroke="rgba(15,23,42,0.08)" />
                      <XAxis
                        dataKey="aso"
                        type="number"
                        name="ASO"
                        tick={{ fontSize: 11, fill: "var(--color-ink-secondary)" }}
                        tickFormatter={(v) => `${v > 0 ? "+" : ""}${v.toFixed(1)}`}
                      />
                      <YAxis
                        dataKey="valor"
                        type="number"
                        name={serie.temporada}
                        tick={{ fontSize: 11, fill: "var(--color-ink-secondary)" }}
                        tickFormatter={(v) => `${v > 0 ? "+" : ""}${v.toFixed(1)}`}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: "1px solid rgba(15,23,42,0.08)" }}
                        formatter={(value: number) => [`${value > 0 ? "+" : ""}${value.toFixed(2)} °C`, ""]}
                      />
                      <Scatter data={serie.pontos} fill="#2563eb" />
                      <Line data={retaDados} dataKey="y" stroke="#dc2626" strokeWidth={2} dot={false} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
