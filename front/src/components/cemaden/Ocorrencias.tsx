import { useEffect, useMemo, useState } from "react";
import { formatarNumero } from "./lib/formato";
import MapaOcorrencias from "./MapaOcorrencias";
import type { EstadoOcorrencias, RespostaOcorrencias } from "./model/types";

interface Props {
	baseApi: string;
}

const ROTULO_TIPO: Record<string, string> = {
	ALAGAMENTO: "Alagamento",
	INUNDACAO: "Inundação",
};

const COR_TIPO: Record<string, string> = {
	ALAGAMENTO: "text-data-cold",
	INUNDACAO: "text-data-warm",
};

/** Lê DD/MM direto do texto ISO: passar por Date aplicaria UTC e poderia voltar um dia. */
function rotuloDia(dia: string): string {
	return `${dia.slice(8, 10)}/${dia.slice(5, 7)}`;
}

export default function Ocorrencias({ baseApi }: Props) {
	const [estado, setEstado] = useState<EstadoOcorrencias>({ fase: "carregando" });
	const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);

	useEffect(() => {
		let cancelado = false;
		(async () => {
			try {
				const resposta = await fetch(`${baseApi}/api/ocorrencias`);
				if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
				const dados = (await resposta.json()) as RespostaOcorrencias;
				if (cancelado) return;

				const dias = dados.dias ?? [];
				if (dias.length === 0) {
					setEstado({ fase: "erro", mensagem: "Nenhuma ocorrência disponível." });
					return;
				}

				const ocorrencias = dados.ocorrencias ?? [];
				setEstado({ fase: "ok", total: dados.total ?? ocorrencias.length, dias, ocorrencias });
				setDiaSelecionado((atual) => atual ?? dias[0]!.dia);
			} catch (erro) {
				if (cancelado) return;
				setEstado({
					fase: "erro",
					mensagem:
						erro instanceof Error ? erro.message : "Falha ao carregar as ocorrências.",
				});
			}
		})();
		return () => {
			cancelado = true;
		};
	}, [baseApi]);

	const doDia = useMemo(() => {
		if (estado.fase !== "ok" || !diaSelecionado) return [];
		return estado.ocorrencias.filter((ocorrencia) => ocorrencia.dia === diaSelecionado);
	}, [estado, diaSelecionado]);

	return (
		<section aria-labelledby="cemaden-ocorrencias" className="mt-10">
			<p className="m-0 mb-1 text-[11px] uppercase tracking-wide text-ink-secondary">
				2 · Ocorrências
			</p>
			<h2
				id="cemaden-ocorrencias"
				className="m-0 text-[20px] leading-[1.2] font-semibold"
			>
				Registro de ocorrências sobre alagamentos e inundações
			</h2>
			<p className="mt-1.5 mb-0 text-[15px] leading-[1.3] text-ink-secondary">
				{estado.fase === "ok"
					? `${formatarNumero(estado.total, 0)} ocorrências em ${estado.dias.length} dias · fonte SIGRC/Defesa Civil`
					: "Ocorrências registradas pela Defesa Civil (SIGRC)."}
			</p>

			{estado.fase === "carregando" && (
				<p className="mt-5 mb-0 text-[14px] text-ink-secondary">
					Carregando ocorrências…
				</p>
			)}

			{estado.fase === "erro" && (
				<p role="alert" className="mt-5 mb-0 text-[14px] text-data-warm">
					Não foi possível carregar as ocorrências: {estado.mensagem}
				</p>
			)}

			{estado.fase === "ok" && diaSelecionado && (
				<>
					<div className="mt-4 rounded-2xl bg-soft p-4">
						<p className="m-0 text-[11px] uppercase tracking-wide text-ink-secondary">
							Datas com ocorrência · {estado.dias.length} dias
						</p>
						<div
							className="mt-2 flex gap-2 overflow-x-auto pb-1"
							role="group"
							aria-label="Selecionar data"
						>
							{estado.dias.map(({ dia, total }) => {
								const ativo = dia === diaSelecionado;
								return (
									<button
										key={dia}
										type="button"
										onClick={() => setDiaSelecionado(dia)}
										aria-pressed={ativo}
										className={`shrink-0 rounded-full border px-3 py-1.5 text-[13px] transition-colors ${
											ativo
												? "border-deep bg-deep text-on-dark"
												: "border-data-neutral/30 bg-bg text-ink hover:bg-soft"
										}`}
									>
										<span className="tabular-nums">{rotuloDia(dia)}</span>
										<span
											className={`ml-1.5 text-[11px] tabular-nums ${
												ativo ? "text-on-dark/70" : "text-data-neutral"
											}`}
										>
											{total}
										</span>
									</button>
								);
							})}
						</div>
					</div>

					<div className="mt-4 rounded-2xl bg-soft p-4">
						<div className="mb-3 flex items-center justify-between">
							<p className="m-0 text-[13px] text-ink-secondary">
								{doDia.length} {doDia.length === 1 ? "ocorrência" : "ocorrências"} em{" "}
								<span className="font-semibold text-ink">
									{rotuloDia(diaSelecionado)}
								</span>
							</p>
							<div className="flex items-center gap-3 text-[12px] text-ink-secondary">
								<span className="flex items-center gap-1">
									<span className="h-2.5 w-2.5 rounded-full bg-[#1976d2]" />
									Alagamento
								</span>
								<span className="flex items-center gap-1">
									<span className="h-2.5 w-2.5 rounded-full bg-[#d32f2f]" />
									Inundação
								</span>
							</div>
						</div>
						<div className="grid gap-4 lg:grid-cols-[minmax(280px,380px)_1fr]">
							<div className="rounded-xl border border-data-neutral/10 overflow-hidden">
								<MapaOcorrencias ocorrencias={doDia} />
							</div>
							<div className="max-h-[420px] overflow-auto rounded-xl bg-bg">
								<table className="w-full text-left text-[13px]">
									<thead className="sticky top-0 z-10 bg-bg text-[11px] uppercase tracking-wide text-ink-secondary shadow-sm">
										<tr>
											<th className="px-4 py-3 font-semibold">Data</th>
											<th className="px-4 py-3 font-semibold">Local</th>
											<th className="px-4 py-3 font-semibold">Tipo</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-data-neutral/10 text-ink-secondary">
										{doDia.map((ocorrencia) => (
											<tr
												key={ocorrencia.id}
												className="transition-colors hover:bg-soft/80"
											>
												<td className="px-4 py-2.5 tabular-nums">
													{rotuloDia(ocorrencia.dia)}
												</td>
												<td className="px-4 py-2.5 text-ink">
													{ocorrencia.local}
												</td>
												<td
													className={`px-4 py-2.5 font-medium ${
														COR_TIPO[ocorrencia.tipo] ?? ""
													}`}
												>
													{ROTULO_TIPO[ocorrencia.tipo] ?? ocorrencia.tipo}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</>
			)}
		</section>
	);
}
