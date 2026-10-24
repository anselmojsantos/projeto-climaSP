/** Escala sequencial de azul para soma_mm. */
export const PALETA_CHUVA = [
	"#f0f9ff",
	"#bae6fd",
	"#7dd3fc",
	"#38bdf8",
	"#0284c7",
	"#075985",
] as const;

/** Cor do ponto quando a situação é sem_leitura. */
export const COR_SEM_LEITURA = "#9ca3af";

export function corPorSoma(soma: number | null, cortes: readonly number[]): string {
	if (soma === null) return PALETA_CHUVA[0]!;
	let indice = 0;
	for (let i = 0; i < cortes.length; i++) {
		if (soma >= cortes[i]!) indice = i;
	}
	return PALETA_CHUVA[Math.min(indice, PALETA_CHUVA.length - 1)]!;
}