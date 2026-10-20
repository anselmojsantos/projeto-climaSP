import { useEffect, useRef, useState } from "react";
import { LEGENDA_REGIOES } from "../model/regioes";
import { formatarNumero, formatarPercentual } from "../../lib/formato";
import type { CamadaLeaflet, MapaLeaflet } from "../lib/mapa";
import type { EstadoRegioes, Props, RespostaRegioes } from "../model/types";
import { COLUNAS } from "../model/colunas";
import "leaflet/dist/leaflet.css";
import "./estilos.css";

function cx(...classes: Array<string | false | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export default function RegioesNino({ baseApi }: Props) {
  const [estado, setEstado] = useState<EstadoRegioes>({ fase: "carregando" });

  const regioes = estado.fase === "ok" ? estado.regioes : [];
  const mesReferencia = estado.fase === "ok" ? estado.mesReferencia : "";

  const containerRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<MapaLeaflet | null>(null);
  const camadaRef = useRef<CamadaLeaflet | null>(null);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      setEstado({ fase: "carregando" });
      try {
        const resposta = await fetch(`${baseApi}/api/anomalias/regioes`);
        if (!resposta.ok) throw new Error(`Backend respondeu com HTTP ${resposta.status}.`);
        const dados = (await resposta.json()) as RespostaRegioes;
        if (cancelado) return;
        setEstado({
          fase: "ok",
          regioes: dados.regioes ?? [],
          mesReferencia: dados.mesReferencia ?? "—",
        });
      } catch (erro) {
        if (cancelado) return;
        setEstado({
          fase: "erro",
          mensagem:
            erro instanceof Error ? erro.message : "Não foi possível carregar as regiões Niño.",
        });
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [baseApi]);

  useEffect(() => {
    const alvo = containerRef.current;
    if (!alvo) return;
    let cancelado = false;
    (async () => {
      const { criarMapa, desenharRegioes } = await import("../lib/mapa");
      if (cancelado) return;
      if (!mapaRef.current) {
        mapaRef.current = criarMapa(alvo);
        window.requestAnimationFrame(() => mapaRef.current?.invalidateSize());
      }
      camadaRef.current?.remove();
      camadaRef.current = desenharRegioes(mapaRef.current, regioes, mesReferencia);
    })();
    return () => {
      cancelado = true;
    };
  }, [regioes, mesReferencia]);

  useEffect(
    () => () => {
      mapaRef.current?.remove();
      mapaRef.current = null;
      camadaRef.current = null;
    },
    [],
  );

  const ultima = regioes.length - 1;

  return (
    <section aria-labelledby="regioes-nino">
      <h2 id="regioes-nino" className="m-0 text-[20px] leading-[1.2] font-semibold">
        Onde o NOAA mede o El Niño
      </h2>
      <p className="mt-1.5 mb-0 text-[15px] leading-[1.3] text-ink-secondary">
        As quatro caixas do Pacífico equatorial (regiões Niño) usadas no diagnóstico
        ENSO — a variável-guia do estudo.
      </p>

      {estado.fase === "carregando" && (
        <p className="mt-5 mb-0 text-[14px] text-ink-secondary">Carregando dados do banco…</p>
      )}

      {estado.fase === "erro" && (
        <p role="alert" className="mt-5 mb-0 text-[14px] text-data-warm">
          Não foi possível carregar as regiões Niño: {estado.mensagem}
        </p>
      )}

      {estado.fase === "ok" && (
        <div className="mt-5 grid items-start gap-4 xl:grid-cols-[400px_1fr] xl:gap-5">
          <figure className="m-0 flex flex-col gap-2 rounded-2xl bg-soft p-4">
            <div
              className=
                "relative z-0 h-[240px] w-full overflow-hidden rounded-lg border border-soft bg-bg"
              role="img"
              aria-label="Mapa das regiões Niño no Pacífico equatorial"
              ref={containerRef}>
            </div>
            <figcaption className="text-[11px] leading-[1.4] text-data-neutral">
              {LEGENDA_REGIOES}
            </figcaption>
          </figure>

          <div className="overflow-x-auto">
            <p className="mb-2 mt-0 text-[13px] font-semibold text-ink">
              Média Geral (07/01/2026 a 09/09/2026)
            </p>
            <table className="w-max min-w-full border-separate border-spacing-x-0 border-spacing-y-1.5 text-left">
              <thead>
                <tr>
                  {COLUNAS.map(({ titulo, largura }, i) => (
                    <th key={titulo} scope="col" className={
                        cx(largura,
                        "bg-deep px-2.5 py-2.5 text-[12px] font-semibold text-on-dark",
                        i === 0 && "rounded-tl-[10px]",
                        i === COLUNAS.length - 1 && "rounded-tr-[10px]",
                      )}
                    >
                      {titulo}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {regioes.map(({ regiao, localizacao, percentualElNino, mediaAnomalia, guia }, indice) => (
                    <tr key={regiao} className={guia ? "text-on-dark" : "text-ink"}>
                      <th scope="row" className={
                          cx(COLUNAS[0].largura,
                          "px-2.5 py-2.5 text-[14px] font-semibold",
                          guia ? "bg-deep" : indice % 2 === 0 ? "bg-bg" : "bg-soft",
                          indice === 0 && "rounded-tl-[10px]",
                          indice === ultima && "rounded-bl-[10px]",
                        )}
                      >
                        {regiao}
                      </th>
                      <td className={cx(
                          COLUNAS[1].largura,
                          "px-2.5 py-2.5 text-[14px]",
                          guia
                            ? "bg-deep text-on-dark/85"
                            : indice % 2 === 0
                              ? "bg-bg text-ink-secondary"
                              : "bg-soft text-ink-secondary",
                          indice === ultima && "rounded-bl-[10px]",
                        )}
                      >
                        {localizacao}
                      </td>
                      <td className={cx(
                          COLUNAS[2].largura,
                          "px-2.5 py-2.5 font-data text-[14px]",
                          guia ? "bg-deep" : indice % 2 === 0 ? "bg-bg" : "bg-soft",
                          indice === ultima && "rounded-bl-[10px]",
                        )}
                      >
                        {formatarPercentual(percentualElNino)} %
                      </td>
                      <td className={cx(
                          COLUNAS[3].largura,
                          "px-2.5 py-2.5 font-data text-[14px] font-bold",
                          guia ? "bg-deep text-amber" : "text-data-warm",
                          indice % 2 === 0 ? "bg-bg" : "bg-soft",
                          indice === ultima && "rounded-br-[10px]",
                        )}
                      >
                        {formatarNumero(mediaAnomalia)} °C
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
