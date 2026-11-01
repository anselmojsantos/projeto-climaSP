import type { Ocorrencia } from "../model/types";

export type MapaLeaflet = any;
export type CamadaLeaflet = any;

const ROTULO_TIPO: Record<string, string> = {
	ALAGAMENTO: "Alagamento",
	INUNDACAO: "Inundação",
};

function rotuloData(dia: string): string {
	if (dia.length < 10) return dia;
	return `${dia.slice(8, 10)}/${dia.slice(5, 7)}`;
}

function corTipo(tipo: string): string {
	return tipo === "INUNDACAO" ? "#d32f2f" : "#1976d2";
}

function htmlIcone(tipo: string): string {
	if (tipo === "INUNDACAO") {
		return `<svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg"><path d="M12 0L2 10C.7 11.3 0 13 0 14.8 0 20.3 5.4 25 12 25s12-4.7 12-10.2c0-1.8-.7-3.5-2-4.8L12 0z" fill="#d32f2f" stroke="#ffffff" stroke-width="1.6"/><circle cx="12" cy="15" r="3" fill="#ffffff"/></svg>`;
	}
	return `<svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg"><path d="M12 0L2 10C.7 11.3 0 13 0 14.8 0 20.3 5.4 25 12 25s12-4.7 12-10.2c0-1.8-.7-3.5-2-4.8L12 0z" fill="#1976d2" stroke="#ffffff" stroke-width="1.6"/><circle cx="12" cy="15" r="3" fill="#ffffff"/></svg>`;
}

export async function criarMapa(alvo: HTMLElement): Promise<MapaLeaflet> {
	const L = await import("leaflet");
	const mapa = L.map(alvo, {
		center: [-23.55, -46.63],
		zoom: 10,
		minZoom: 9,
		maxZoom: 14,
		scrollWheelZoom: true,
		attributionControl: false,
	});

	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		maxZoom: 14,
		attribution: "© OpenStreetMap contributors",
	}).addTo(mapa);

	return mapa;
}

export async function desenharOcorrencias(mapa: MapaLeaflet, ocorrencias: Ocorrencia[]): Promise<CamadaLeaflet> {
	const L = await import("leaflet");
	const grupo = L.layerGroup().addTo(mapa);
	const marcadores: any[] = [];

	for (let i = 0; i < ocorrencias.length; i += 1) {
		const o = ocorrencias[i];
		if (!o) continue;
		if (o.latitude === null || o.longitude === null) continue;
		if (!Number.isFinite(o.latitude) || !Number.isFinite(o.longitude)) continue;

		const icone = L.divIcon({
			className: "",
			html: htmlIcone(o.tipo),
			iconSize: [24, 32],
			iconAnchor: [12, 32],
			popupAnchor: [0, -30],
		});

		const marcador = L.marker([o.latitude, o.longitude], { icon: icone })
			.bindPopup(
				`<div style="font-family:Inter,sans-serif;font-size:11px;line-height:1.35"><b>Local:</b> ${o.local || "-"}<br/><b>Tipo:</b> ${ROTULO_TIPO[o.tipo] || o.tipo}<br/><b>Data:</b> ${rotuloData(o.dia)}</div>`,
			)
			.addTo(grupo);

		marcadores.push(marcador);
	}

	if (marcadores.length > 0) {
		try {
			const bounds = L.featureGroup(marcadores).getBounds();
			mapa.fitBounds(bounds.pad(0.1));
		} catch (e) {}
	}

	return grupo;
}
