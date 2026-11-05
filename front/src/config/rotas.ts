export interface Rota {
	slug: string;
	path: string;
	menu: string;
	titulo: string;
	ordem?: number;
}

export const ROTAS: Rota[] = [
	{ slug: "home", path: "/home", menu: "Home", titulo: "Bem vindos(as)", ordem: 1 },
	{ slug: "dados-noaa", path: "/dados-noaa", menu: "Dados Noaa", titulo: "Análise - Base de Dados Noaa", ordem: 2 },
	{ slug: "dados-cmd", path: "/dados-cmd", menu: "Dados Cemaden", titulo: "Dados Cemaden", ordem: 3 },
	{ slug: "menu-4", path: "/menu-4", menu: "Impactos do Niño", titulo: "Impacto do Niño 3.4 na chuva de São Paulo", ordem: 4 },
];

export function getRotaPorSlug(slug: string): Rota {
	const rota = ROTAS.find((r) => r.slug === slug);
	if (!rota) throw new Error(`Rota não encontrada para slug: ${slug}`);
	return rota;
}

export function getRotaPorPath(path: string): Rota | undefined {
	const p = path.replace(/\/$/, "") || "/home";
	return ROTAS.find((r) => r.path === p);
}
