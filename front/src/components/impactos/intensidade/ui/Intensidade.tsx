import { useEffect, useState } from "react";
import {
  formatarComSinal,
  formatarDecimal,
} from "../../lib/formato";
import type {
  EstadoIntensidade,
  MetricaIntensidade,
  Props,
  RespostaIntensidade,
} from "../model/types";

function valoresDe(metricas: MetricaIntensidade[], chave: string): number[] {
  return metricas
    .filter((metrica) => metrica.chave === chave)
    .map((metrica) => metrica.pct)
    .filter((valor): valor is number => valor !== null);
}

function media(valores: number[]): number | null {
  if (valores.length === 0) return null;
  return valores.reduce((soma, valor) => soma + valor, 0) / valores.length;
}

function faixa(valores: number[]): [number, number] | null {
  if (valores.length === 0) return null;
  return [Math.min(...valores), Math.max(...valores)];
}

function Cartao({
  titulo,
  valor,
  detalhe,
}: {
  titulo: string;
  valor: string;
  detalhe: string;
}) {
  return (
    <div className="rounded-2xl border border-data-neutral/20 p-4">
      <p className="m-0 text-[12px] text-ink-secondary">{titulo}</p>
      <p className="mt-1 mb-0 font-data text-[27px] leading-none text-deep">
        {valor}
      </p>
      <p className="mt-1 mb-0 text-[13px] leading-[1.4] text-ink-secondary">
        {detalhe}
      </p>
    </div>
  );
}

export default function Intensidade({ baseApi }: Props) {
  const [estado, setEstado] = useState<EstadoIntensidade>({ fase: "carregando" });

  useEffect(() => {
    let cancelado = false;
    (async () => {
      setEstado({ fase: "carregando" });
      try {
        const resposta = await fetch(`${baseApi}/api/chuvas/intensidade`);
        if (!resposta.ok) throw new Error(`Backend respondeu com HTTP ${resposta.status}.`);
        const dados = (await resposta.json()) as RespostaIntensidade;
        if (cancelado) return;
        setEstado({ fase: "ok", zonas: dados.zonas ?? [] });
      } catch (erro) {
        if (cancelado) return;
        setEstado({
          fase: "erro",
          mensagem:
            erro instanceof Error
              ? erro.message
              : "Não foi possível carregar a intensidade da chuva.",
        });
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [baseApi]);

  const metricas =
    estado.fase === "ok" ? estado.zonas.flatMap((zona) => zona.metricas) : [];

  const chuvaMedia = media(valoresDe(metricas, "chuva_mm"));
  const chuvaFaixa = faixa(valoresDe(metricas, "chuva_mm"));
  const diaMedia = media(valoresDe(metricas, "max_dia_mm"));
  const diaFaixa = faixa(valoresDe(metricas, "max_dia_mm"));

  const fatores = metricas
    .filter((metrica) => metrica.chave === "dias_ge_25")
    .map((metrica) => metrica.fator)
    .filter((valor): valor is number => valor !== null);
  const fatorMin = fatores.length > 0 ? Math.min(...fatores) : null;
  const fatorMax = fatores.length > 0 ? Math.max(...fatores) : null;
  const diasMin =
    fatorMin === null ? null : Math.round((fatorMin - 1) * 100);
  const diasMax =
    fatorMax === null ? null : Math.round((fatorMax - 1) * 100);

  const pValores = metricas
    .filter((metrica) => metrica.chave === "dias_ge_25")
    .map((metrica) => metrica.p)
    .filter((valor): valor is number => valor !== null);
  const zonasFirmes = pValores.filter((valor) => valor < 0.05).length;

  const valorChuva =
    chuvaMedia === null ? "—" : `${formatarComSinal(chuvaMedia, 0)}%`;
  const detalheChuva =
    chuvaFaixa === null
      ? "por °C"
      : `de ${formatarComSinal(chuvaFaixa[0], 0)}% a ${formatarComSinal(chuvaFaixa[1], 0)}% por °C`;

  const valorDia =
    diaMedia === null ? "—" : `${formatarComSinal(diaMedia, 0)}%`;
  const detalheDia =
    diaFaixa === null
      ? "por °C"
      : `de ${formatarComSinal(diaFaixa[0], 0)}% a ${formatarComSinal(diaFaixa[1], 0)}% por °C`;

  const valorDias =
    diasMin === null || diasMax === null
      ? "—"
      : `${formatarComSinal(diasMin, 0)}% a ${formatarComSinal(diasMax, 0)}%`;
  const detalheDias =
    fatorMin === null || fatorMax === null
      ? "por °C"
      : `${formatarDecimal(fatorMin, 2)} a ${formatarDecimal(fatorMax, 2)} vez por °C`;

  return (
    <section
      aria-labelledby="impactos-intensidade"
      className="border-t border-data-neutral/15 pt-10"
    >
      <p className="m-0 mb-1 text-[11px] uppercase tracking-wide text-ink-secondary">
        3 · Intensidade
      </p>
      <h2
        id="impactos-intensidade"
        className="m-0 text-[21px] leading-[1.2] font-semibold"
      >
        Chove mais forte também
      </h2>

      <div className="mt-2 flex max-w-[820px] flex-col gap-2 text-[15px] leading-[1.5] text-ink-secondary">
        <p className="m-0">
          Chuva em excesso não é só volume. O mesmo total pode cair em 30 dias
          de garoa ou em duas tempestades. Para ver a diferença, medimos três
          coisas: o total do mês, o dia mais chuvoso e quantos dias tiveram 25
          mm ou mais. Chamamos esses dias de chuva forte.
        </p>
        <p className="m-0">
          A conta é uma regressão simples. Para cada zona, comparamos a chuva de
          cada mês com a temperatura do Pacífico naquele mês, sempre dentro do
          mesmo mês do ano (janeiro com janeiro, fevereiro com fevereiro...).
          Assim, o efeito do Niño não se confunde com a época do ano.
        </p>
      </div>

      {estado.fase === "carregando" && (
        <p className="mt-5 mb-0 text-[14px] text-ink-secondary">
          Carregando o efeito por grau…
        </p>
      )}

      {estado.fase === "erro" && (
        <p role="alert" className="mt-5 mb-0 text-[14px] text-data-warm">
          Não foi possível carregar a intensidade: {estado.mensagem}
        </p>
      )}

      {estado.fase === "ok" && (
        <div className="mt-5 flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Cartao
              titulo="Chuva do mês"
              valor={valorChuva}
              detalhe={detalheChuva}
            />
            <Cartao
              titulo="Dia mais chuvoso"
              valor={valorDia}
              detalhe={detalheDia}
            />
            <Cartao
              titulo="Dias com 25 mm ou mais"
              valor={valorDias}
              detalhe={detalheDias}
            />
          </div>

          <div className="flex max-w-[820px] flex-col gap-2 text-[13px] leading-[1.45] text-ink-secondary">
            <p className="m-0">
              O efeito é pequeno e tem incerteza. Para o total, o intervalo de
              95% vai de +1,0 a +10,7 mm por °C. Para os dias de chuva forte, o
              resultado é mais firme em{" "}
              {zonasFirmes === 0
                ? "nenhuma zona"
                : `${zonasFirmes} das 5 zonas`}{" "}
              (p abaixo de 0,05) e mais fraco nas outras. O p é a chance de o
              resultado ser acaso; abaixo de 0,05, é pouco provável.
            </p>
            <p className="m-0">
              Não é machine learning: é uma conta de regressão sobre a chuva que
              foi medida.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
