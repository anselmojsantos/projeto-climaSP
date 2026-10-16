import { useCallback, useEffect, useState } from "react";
import {formatarData, formatarNumero, formatarPercentual, rotuloCentroTemporada } from "./libs/formato";
import type { Estado, Props, RespostaSinal, Visao } from "./CardElNino/types";
import { VISAO_INDISPONIVEL } from "./CardElNino/visao";

const SINAL_ROTULO = "Estágio de El Niño 3.4 -";
const SINAL_REGIAO = "Pacífico Centro-Leste";

function montarVisao(estado: Estado): Visao {
  if (estado.fase === "erro") {
    return { ...VISAO_INDISPONIVEL, subtitulo: estado.mensagem, status: estado.mensagem };
  }

  if (estado.fase === "carregando") {
    return {
      ...VISAO_INDISPONIVEL,
      evento: "Carregando",
      subtitulo: "Consultando o backend...",
      procedencia: "Carregando procedência dos dados...",
      cobertura: "Calculando cobertura...",
    };
  }

  const { oni, projecao, weekly, coverage, frequencia } = estado.dados;

  return {
    evento: oni.evento ?? "Fase indisponível",
    subtitulo: `Temporada ${oni.temporada}/${oni.ano} · ${oni.origem ?? "origem não informada"}`,
    temporadaRotulo: rotuloCentroTemporada(oni.temporada, oni.ano),
    oniValor: `${formatarNumero(oni.nino34_mm3)} °C`,
    nino34Data: formatarData(weekly.observation_date),
    nino34Valor: `${formatarNumero(weekly.nino34)} °C`,
    projecaoRotulo: `Projeção para ${projecao.temporada}`,
    projecaoData: rotuloCentroTemporada(projecao.temporada, projecao.ano),
    projecaoValor: `${formatarNumero(projecao.nino34_mm3)} °C`,
    procedencia: `Dados semanais: ${formatarData(coverage.first_observation_date)} a ${formatarData(coverage.last_observation_date)} (${coverage.total_weeks} semanas).`,
    cobertura: `${formatarPercentual(frequencia.percentual)}% das semanas com anomalia acima de +0,5 °C na região ${frequencia.regiao}.`,
    status: "Sinal ENSO carregado dados da base.",
  };
}

export default function CardElNino({ baseApi }: Props) {
  const [estado, setEstado] = useState<Estado>({ fase: "carregando" });

  const carregar = useCallback(async () => {
    setEstado({ fase: "carregando" });
    try {
      const resposta = await fetch(`${baseApi}/api/enso/sinal`);
      if (!resposta.ok) {
        throw new Error(`Backend respondeu com HTTP ${resposta.status}.`);
      }
      const dados = (await resposta.json()) as RespostaSinal;
      setEstado({ fase: "ok", dados });
    } catch (erro) {
      setEstado({
        fase: "erro",
        mensagem:
          erro instanceof Error ? erro.message : "Não foi possível carregar o sinal ENSO.",
      });
    }
  }, [baseApi]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const visao = montarVisao(estado);

  return (
    <aside className=
      "flex w-full flex-col gap-3 rounded-panel bg-deep p-4 text-on-dark xl:w-[440px] xl:shrink-0 xl:p-5"
      aria-label="Leitura do sinal ENSO">
      <div className="flex items-start gap-2">
        <span className="mt-1 size-2.5 shrink-0 rounded-full bg-data-warm"></span>
        <span className="min-w-0 flex-1 text-[14px] font-semibold tracking-widest leading-[1.35]">
          {SINAL_ROTULO}
          <span className="block">{SINAL_REGIAO}</span>
        </span>
        <span className=
          "shrink-0 whitespace-nowrap rounded-full bg-data-warm px-1.5 py-1.5 text-[11px] font-semibold"
        >
          {visao.evento}
        </span>
      </div>

      <span className="flex items-baseline justify-between gap-3 text-[14px] leading-[1.3] text-on-dark/75">
        <span>{visao.subtitulo}</span>
        <span className="shrink-0">{visao.temporadaRotulo}</span>
      </span>

      <div className="flex flex-col gap-1">
        <span className="font-data text-[24px] font-bold">{visao.oniValor}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="flex items-baseline justify-between gap-3 text-[14px] leading-[1.3] text-on-dark/75">
          <span>Leitura da última semana</span>
          <span className="shrink-0">{visao.nino34Data}</span>
        </span>
        <span className="font-data text-[24px] font-bold">{visao.nino34Valor}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="flex items-baseline justify-between gap-3 text-[14px] leading-[1.3] text-on-dark/75">
          <span>{visao.projecaoRotulo}</span>
          <span className="shrink-0">{visao.projecaoData}</span>
        </span>
        <span className="font-data text-[24px] font-bold">{visao.projecaoValor}</span>
      </div>

      <div className="h-px w-full bg-on-dark/15"></div>

      <p className="m-0 text-[14px] leading-[1.45] text-on-dark/70">{visao.procedencia}</p>

      <p className="m-0 rounded-inset bg-on-dark/8 px-2.5 py-2.5 text-[14px] leading-[1.4]">
        {visao.cobertura}
      </p>

      <p role="status" aria-live="polite" className="sr-only">
        {visao.status}
      </p>
    </aside>
  );
}
