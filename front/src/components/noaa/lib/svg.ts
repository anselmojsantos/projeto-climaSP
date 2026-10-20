/**
 * Monta o atributo `d` de um `<path>` ligando valores consecutivos.
 * Um valor nulo interrompe a linha; o ponto seguinte reabre com "M".
 */
export function caminhoDe(
	valores: (number | null)[],
	px: (indice: number) => number,
	py: (valor: number) => number,
): string {
	let abrir = true;
	const partes: string[] = [];

	valores.forEach((valor, indice) => {
		if (valor === null) {
			abrir = true;
			return;
		}
		partes.push(`${abrir ? "M" : "L"} ${px(indice)} ${py(valor)}`);
		abrir = false;
	});

	return partes.join(" ");
}
