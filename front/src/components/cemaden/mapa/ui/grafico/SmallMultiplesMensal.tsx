import { corPorSoma } from "../../model/paleta";
import { CORTES_SOMA_MM, COR_CELULA_VAZIA } from "../../model/limiares";
import type { Estacao } from "../../model/types";
import HeatmapEstacoes from "./HeatmapEstacoes";

interface Props {
	meses: string[];
	porMes: Record<string, Estacao[]>;
}

const MES_CURTO: Record<string, string> = {
	"01": "Jan",
	"02": "Fev",
	"03": "Mar",
	"04": "Abr",
	"05": "Mai",
	"06": "Jun",
	"07": "Jul",
	"08": "Ago",
	"09": "Set",
	"10": "Out",
	"11": "Nov",
	"12": "Dez",
};

function rotuloMes(periodo: string): string {
	const [, mes] = periodo.split("-");
	return MES_CURTO[mes ?? ""] ?? periodo;
}

export default function SmallMultiplesMensal({ meses, porMes }: Props) {
	return (
		<figure className="m-0 flex flex-col gap-3 rounded-2xl bg-soft p-4">
			<p className="m-0 text-[11px] uppercase tracking-wide text-ink-secondary">
				Evolução mensal
			</p>
			<h3 className="m-0 text-[16px] font-semibold">
				Padrão espacial da chuva por mês
			</h3>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
				{meses.map((periodo) => (
					<div key={periodo} className="flex flex-col gap-1">
						<p className="m-0 text-center text-[12px] font-semibold text-ink-secondary">
							{rotuloMes(periodo)}
						</p>
						<p className="m-0 text-center text-[11px] text-ink-secondary">
							{(porMes[periodo] ?? []).length} estações
						</p>
						<HeatmapEstacoes
							estacoes={porMes[periodo] ?? []}
							largura={180}
							altura={200}
							compacto
						/>
					</div>
				))}
			</div>

			<figcaption className="flex flex-wrap items-center gap-2 text-[12px] text-data-neutral">
				<span className="text-ink-secondary">Escala (mm):</span>
				{CORTES_SOMA_MM.map((corte) => (
					<span key={corte} className="flex items-center gap-1">
						<span
							className="h-3 w-3 rounded-sm"
							style={{ backgroundColor: corPorSoma(corte, CORTES_SOMA_MM) }}
						/>
						{corte}+
					</span>
				))}
				<span className="flex items-center gap-1">
					<span
						className="h-3 w-3 rounded-sm"
						style={{ backgroundColor: COR_CELULA_VAZIA }}
					/>
					sem leitura
				</span>
			</figcaption>
		</figure>
	);
}