/** Formata número com separador de milhar pt-BR e N casas decimais. */
export function formatarNumero(valor: number | null | undefined, casas = 2): string {
	if (valor === null || valor === undefined || !Number.isFinite(valor)) {
		return "—";
	}
	return valor.toLocaleString("pt-BR", {
		minimumFractionDigits: casas,
		maximumFractionDigits: casas,
	});
}