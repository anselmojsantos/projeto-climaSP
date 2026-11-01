import { useEffect, useState } from "react";
import HeatmapEstacoes from "./HeatmapEstacoes";
import type {
	EstadoCemaden,
	EstadoMeses,
	Props,
	RespostaCemadenMensal,
	RespostaCemadenMeses,
} from "./model/types";

export default function CemadenMensal({ baseApi }: Props) {
	const [meses, setMeses] = useState<EstadoMeses>({ fase: "carregando" });
	const [periodo, setPeriodo] = useState<string | null>(null);
	const [estado, setEstado] = useState<EstadoCemaden>({ fase: "carregando" });

	useEffect(() => {
		let cancelado = false;
		(async () => {
			try {
				const r = await fetch(`${baseApi}/api/cemaden/meses`);
				if (!r.ok) throw new Error(`HTTP ${r.status}`);
				const dados = (await r.json()) as RespostaCemadenMeses;
				if (cancelado) return;
				const lista = dados.meses ?? [];
				if (lista.length === 0) {
					setMeses({ fase: "erro", mensagem: "Nenhum mês disponível." });
					return;
				}
				setMeses({ fase: "ok", meses: lista });
				setPeriodo((atual) => atual ?? lista[lista.length - 1]!);
			} catch (e) {
				if (cancelado) return;
				setMeses({
					fase: "erro",
					mensagem: e instanceof Error ? e.message : "Falha ao listar meses.",
				});
			}
		})();
		return () => {
			cancelado = true;
		};
	}, [baseApi]);

	useEffect(() => {
		if (!periodo) return;
		let cancelado = false;
		(async () => {
			setEstado({ fase: "carregando" });
			try {
				const r = await fetch(
					`${baseApi}/api/cemaden/mensal?periodo=${encodeURIComponent(periodo)}`,
				);
				if (!r.ok) throw new Error(`HTTP ${r.status}`);
				const dados = (await r.json()) as RespostaCemadenMensal;
				if (cancelado) return;
				setEstado({
					fase: "ok",
					periodo: dados.periodo ?? periodo,
					totalEstacoes: dados.totalEstacoes ?? 0,
					somaTotalMm: dados.somaTotalMm ?? 0,
					mediaSomaMm: dados.mediaSomaMm ?? null,
					estacoesComChuva: dados.estacoesComChuva ?? 0,
					estacoes: dados.estacoes ?? [],
				});
			} catch (e) {
				if (cancelado) return;
				setEstado({
					fase: "erro",
					mensagem:
						e instanceof Error ? e.message : "Não foi possível carregar o CEMADEN.",
				});
			}
		})();
		return () => {
			cancelado = true;
		};
	}, [baseApi, periodo]);

	return (
		<section aria-labelledby="cemaden-mensal">
			<p className="m-0 mb-1 text-[11px] uppercase tracking-wide text-ink-secondary">
				1 · Chuva por estação
			</p>
			<h2 id="cemaden-mensal" className="m-0 text-[20px] leading-[1.2] font-semibold">
				CEMADEN — chuva por estação
			</h2>
			<p className="mt-1.5 mb-0 text-[15px] leading-[1.3] text-ink-secondary">
				Soma de chuva por estação no mês selecionado, com a cobertura de leituras de cada
				ponto.
			</p>

			{meses.fase === "ok" && (
				<div className="mt-4">
					<label className="text-[13px] text-ink-secondary">
						Mês:{" "}
						<select
							value={periodo ?? ""}
							onChange={(e) => setPeriodo(e.target.value)}
							className="rounded-md border border-data-neutral/30 bg-bg px-2 py-1 text-[14px]"
						>
							{meses.meses.map((m) => (
								<option key={m} value={m}>
									{m}
								</option>
							))}
						</select>
					</label>
				</div>
			)}

			{meses.fase === "erro" && (
				<p role="alert" className="mt-4 mb-0 text-[14px] text-data-warm">
					{meses.mensagem}
				</p>
			)}

			{estado.fase === "carregando" && (
				<p className="mt-5 mb-0 text-[14px] text-ink-secondary">
					Carregando dados do CEMADEN…
				</p>
			)}

			{estado.fase === "erro" && (
				<p role="alert" className="mt-5 mb-0 text-[14px] text-data-warm">
					Não foi possível carregar o CEMADEN: {estado.mensagem}
				</p>
			)}

			{estado.fase === "ok" && (
				<div className="mt-5 flex flex-col gap-4">
					<div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
						<Kpi rotulo="Estações" valor={String(estado.totalEstacoes)} />
						<Kpi
							rotulo="Soma total"
							valor={`${estado.somaTotalMm.toLocaleString("pt-BR", {
								maximumFractionDigits: 0,
							})} mm`}
						/>
						<Kpi
							rotulo="Média por estação"
							valor={
								estado.mediaSomaMm === null
									? "—"
									: `${estado.mediaSomaMm.toLocaleString("pt-BR", {
											maximumFractionDigits: 1,
										})} mm`
							}
						/>
						<Kpi
							rotulo="Estações com chuva"
							valor={String(estado.estacoesComChuva)}
						/>
					</div>

					<HeatmapEstacoes estacoes={estado.estacoes} />
				</div>
			)}
		</section>
	);
}

function Kpi({ rotulo, valor }: { rotulo: string; valor: string }) {
	return (
		<div className="rounded-xl bg-soft p-3">
			<p className="m-0 text-[11px] uppercase tracking-wide text-ink-secondary">
				{rotulo}
			</p>
			<p className="m-0 mt-1 text-[20px] font-semibold">{valor}</p>
		</div>
	);
}