import { useEffect, useRef } from "react";
import { formatarNumero } from "../../lib/formato";
import type { Estacao } from "../../model/types";

interface Props {
	titulo: string;
	estacoes: Estacao[];
	onFechar: () => void;
}

export default function ModalEstacoes({ titulo, estacoes, onFechar }: Props) {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (dialog && !dialog.open) {
			dialog.showModal();
		}
	}, []);

	return (
		<dialog
			ref={dialogRef}
			onClose={onFechar}
			onClick={(e) => {
				if (e.target === dialogRef.current) onFechar();
			}}
			className="fixed inset-0 m-0 h-full w-full max-h-none max-w-none border-none bg-transparent p-4 backdrop:bg-black/40 backdrop:backdrop-blur-sm open:flex open:items-center open:justify-center"
		>
			{/* CSS para as animações suaves */}
			<style>{`
				dialog[open]::backdrop {
					animation: fadeIn 0.2s ease-out forwards;
				}
				dialog[open] > div {
					animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
				}
				@keyframes fadeIn {
					from { opacity: 0; }
					to { opacity: 1; }
				}
				@keyframes slideUp {
					from { opacity: 0; transform: translateY(20px) scale(0.95); }
					to { opacity: 1; transform: translateY(0) scale(1); }
				}
			`}</style>

			{/* Conteúdo do Modal */}
			<div className="relative flex w-full max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-bg shadow-2xl">
				{/* Cabeçalho */}
				<div className="flex items-center justify-between border-b border-data-neutral/10 p-5 shrink-0 bg-bg">
					<h3 className="m-0 text-[18px] font-semibold text-ink-primary">
						{titulo}
					</h3>
					<button
						type="button"
						onClick={onFechar}
						className="group flex h-8 w-8 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-soft hover:text-ink-primary cursor-pointer"
						aria-label="Fechar"
					>
						<span className="text-[20px] leading-none mb-0.5 group-hover:rotate-90 transition-transform duration-200">
							✕
						</span>
					</button>
				</div>

				{/* Tabela de Estações */}
				<div className="overflow-auto p-0 flex-1">
					<table className="w-full text-left text-[13px] text-ink-secondary">
						<thead className="sticky top-0 bg-bg text-[11px] uppercase tracking-wide shadow-sm z-10">
							<tr>
								<th className="px-5 py-3 font-semibold">Estação</th>
								<th className="px-5 py-3 font-semibold">Município</th>
								<th className="px-5 py-3 font-semibold text-right">Chuva (mm/h)</th>
								<th className="px-5 py-3 font-semibold text-right">Leituras (h)</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-data-neutral/5">
							{estacoes.map((est) => (
								<tr key={est.codEstacao} className="transition-colors hover:bg-soft/50">
									<td className="px-5 py-3 text-ink-primary font-medium">{est.nomeEstacao}</td>
									<td className="px-5 py-3">{est.municipio}</td>
									<td className="px-5 py-3 text-right font-medium text-ink-primary">
										{formatarNumero(est.somaMm, 1)}
									</td>
									<td className="px-5 py-3 text-right">
										{formatarNumero(est.nObs, 0)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Rodapé */}
				<div className="border-t border-data-neutral/10 bg-soft/30 p-4 text-[12px] text-ink-secondary shrink-0 text-center">
					{estacoes.length} estação(ões) nesta célula.
				</div>
			</div>
		</dialog>
	);
}