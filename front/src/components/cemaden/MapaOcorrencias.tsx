import { useEffect, useRef } from "react";
import type { CamadaLeaflet, MapaLeaflet } from "./lib/mapa";
import type { Ocorrencia } from "./model/types";

interface Props {
	ocorrencias: Ocorrencia[];
}

function corrigirIconeDefault(L: any) {
	const proto = L.Icon.Default.prototype as any;
	delete proto._getIconUrl;
	L.Icon.Default.mergeOptions({
		iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
		iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
		shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
	});
}

export default function MapaOcorrencias({ ocorrencias }: Props) {
	const containerRef = useRef<HTMLDivElement>(null);
	const mapaRef = useRef<MapaLeaflet | null>(null);
	const camadaRef = useRef<CamadaLeaflet | null>(null);

	useEffect(() => {
		if (typeof window === "undefined") return;
		let cancelado = false;

		(async () => {
			await import("leaflet/dist/leaflet.css");
			const L = await import("leaflet");
			if (cancelado) return;
			corrigirIconeDefault(L);
			const alvo = containerRef.current;
			if (!alvo) return;
			if (mapaRef.current) return;

			const { criarMapa } = await import("./lib/mapa");
			if (cancelado) return;
			mapaRef.current = await criarMapa(alvo);

			const id1 = window.requestAnimationFrame(() => {
				try {
					mapaRef.current?.invalidateSize();
				} catch (e) {}
			});
			const id2 = window.setTimeout(() => {
				try {
					mapaRef.current?.invalidateSize();
				} catch (e) {}
			}, 100);

			return () => {
				window.cancelAnimationFrame(id1);
				window.clearTimeout(id2);
			};
		})();

		return () => {
			cancelado = true;
		};
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const mapa = mapaRef.current;
		if (!mapa) return;
		let cancelado = false;

		(async () => {
			const { desenharOcorrencias } = await import("./lib/mapa");
			if (cancelado) return;
			camadaRef.current?.remove();
			camadaRef.current = await desenharOcorrencias(mapa, ocorrencias);

			const id1 = window.requestAnimationFrame(() => {
				try {
					mapa.invalidateSize();
				} catch (e) {}
			});
			const id2 = window.setTimeout(() => {
				try {
					mapa.invalidateSize();
				} catch (e) {}
			}, 150);

			return () => {
				window.cancelAnimationFrame(id1);
				window.clearTimeout(id2);
			};
		})();

		return () => {
			cancelado = true;
		};
	}, [ocorrencias]);

	useEffect(() => {
		return () => {
			camadaRef.current?.remove();
			camadaRef.current = null;
			mapaRef.current?.remove();
			mapaRef.current = null;
		};
	}, []);

	return (
		<div
			ref={containerRef}
			style={{ height: "420px", width: "100%", position: "relative" }}
			aria-label="Mapa de ocorrências por local"
		/>
	);
}
