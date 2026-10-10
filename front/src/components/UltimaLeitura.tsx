import { useCallback, useEffect, useState } from "react";

interface Props {
  baseApi: string;
}

interface LeituraDf2026 {
    Temporada: string;
    NINO34_MM3: number | string | null;
    Fase: string | null;
    Origem: string | null; 
}

type EstadoJas =
  | { fase: "carregando" }
  | { fase: "erro"; mensagem: string }
  | { fase: "ok"; leitura: LeituraDf2026 };

function formatarAnomalia(valor: number | string | null): string {
  if (valor === null || valor === "") return "—";
  const numero = Number(valor);
  return Number.isFinite(numero)
    ? new Intl.NumberFormat("pt-BR", {
        signDisplay: "always",
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(numero)
    : "—";
}

export default function UltimaLeitura({ baseApi }: Props) {
  const [estadoJas, setEstadoJas] = useState<EstadoJas>({ fase: "carregando" });

  const carregar = useCallback(async () => {
    setEstadoJas({ fase: "carregando" });
    try {
      const resposta = await fetch(`${baseApi}/api/enso/2026?temporada=JAS`);
      if (!resposta.ok) {
        throw new Error(
          resposta.status === 404
            ? "Não há registro para a temporada JAS."
            : "Não foi possível consultar a leitura JAS.",
        );
      }
      const leitura = (await resposta.json()) as LeituraDf2026;
      setEstadoJas({ fase: "ok", leitura });
    } catch (erro) {
      setEstadoJas({
        fase: "erro",
        mensagem: erro instanceof Error ? erro.message : "Não foi possível carregar a leitura JAS.",
      });
    }
  }, [baseApi]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return (
    <section className="mt-8 max-w-5xl" aria-labelledby="ultima-leitura-titulo">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-soft pb-4">
        <div>
          <p className="m-0 font-data text-[12px] text-ink-secondary">BANCO · df_2026</p>
          <h2 id="ultima-leitura-titulo" className="mt-2 mb-0 text-[20px] font-semibold">
            Leitura da temporada JAS
          </h2>
        </div>
        <button
          type="button"
          onClick={() => void carregar()}
          disabled={estadoJas.fase === "carregando"}
          className="rounded-inset border border-soft bg-white px-4 py-2 text-[13px] font-medium text-deep transition-colors hover:border-accent disabled:cursor-wait disabled:opacity-60"
        >
          Atualizar
        </button>
      </div>

      {estadoJas.fase === "carregando" && (
        <p role="status" aria-live="polite" className="mt-5 text-[14px] text-ink-secondary">
          Buscando a leitura JAS...
        </p>
      )}
      {estadoJas.fase === "erro" && (
        <p role="status" className="mt-5 text-[14px] text-data-warm">
          {estadoJas.mensagem}
        </p>
      )}
      {estadoJas.fase === "ok" && (
        <div className="mt-5 border-t border-soft pt-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="m-0 font-data text-[12px] text-ink-secondary">
                TEMPORADA {estadoJas.leitura.Temporada}
              </p>
              <h3 className="mt-1 mb-0 text-[16px] font-semibold text-deep">Niño 3.4</h3>
            </div>
            <p className="m-0 font-data text-[25px] font-semibold text-data-warm">
              {formatarAnomalia(estadoJas.leitura.NINO34_MM3)} °C
            </p>
          </div>
          <p className="mt-2 mb-0 text-[13px] text-ink-secondary">
            Evento: {estadoJas.leitura.Fase ?? "—"} · Origem: {estadoJas.leitura.Origem ?? "—"}
          </p>
        </div>
      )}
    </section>
  );
}