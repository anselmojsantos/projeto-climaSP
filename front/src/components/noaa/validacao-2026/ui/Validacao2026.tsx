import { useEffect, useState } from "react";
import GraficoValidacao from "./grafico/GraficoValidacao";
import { ajustarReta } from "../lib/regressao";
import type {
  EstadoValidacao,
  PontoValidacao,
  Props,
  RespostaValidacao,
  SerieValidacao,
} from "../model/types";

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

  const aso2026 = estado.fase === "ok" ? estado.aso2026 : null;

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
        <div className="mt-5">
          <GraficoValidacao series={series} aso2026={aso2026} />
        </div>
      )}
    </section>
  );
}
