import * as L from "leaflet";
import type { BoundsRegiao } from "../model/regioes";
import { formatarNumero, type ValorNumerico } from "../../lib/formato";

export type MapaLeaflet = L.Map;
export type CamadaLeaflet = L.LayerGroup;

export interface RegiaoMapa {
  regiao: string;
  mediaMensal?: ValorNumerico;
  bounds?: BoundsRegiao | null;
}

function chaveRegiao(regiao: string): string {
  return regiao.replace(/^★\s*/, "").toLowerCase();
}

/** Limiares do status: > +0,5 aquecimento; < -0,5 resfriamento; senão neutro. */
function statusDe(valor: ValorNumerico | undefined): string {
  if (valor === null || valor === undefined || valor === "") return "—";
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return "—";
  if (numero > 0.5) return "Aquecendo";
  if (numero < -0.5) return "Resfriando";
  return "Neutro";
}

/** Cor por status, na mesma régua do rótulo: azul do tema (frio), vermelho (quente), neutro no meio. */
function corStatus(valor: ValorNumerico | undefined): string {
  const numero = Number(valor);
  if (Number.isFinite(numero)) {
    if (numero > 0.5) return "#cb182b";
    if (numero < -0.5) return "#0e3a5d";
  }
  return "#8a9099";
}

/**
 * O Leaflet não dobra retângulos pelo antimeridiano: a Niño 4 (160°E–150°W)
 * precisa ser dividida em duas caixas para o lado oeste (150°W–180°) ficar visível.
 */
function segmentosDeLongitude(lon: [number, number]): Array<[number, number]> {
  const [min, max] = lon;
  if (min >= -180 && max <= 180) return [[min, max]];
  return [
    [min, 180],
    [-180, max - 360],
  ];
}

export function criarMapa(alvo: HTMLElement): MapaLeaflet {
  const mapa = L.map(alvo, {
    center: [-2, -140],
    zoom: 1.3,
    minZoom: 1,
    scrollWheelZoom: false,
    worldCopyJump: true,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(mapa);

  const legenda = new L.Control({ position: "bottomleft" });
  legenda.onAdd = () => {
    const div = L.DomUtil.create("div", "legenda-mapa");
    div.innerHTML =
      '<p class="legenda-titulo">Regiões de anomalias do El Niño</p>' +
      '<div class="legenda-barra"></div>' +
      '<div class="legenda-escala">' +
      '<span class="legenda-frio">Resfriando </span>' +
      '<span class="legenda-neutro" >Neutro</span>' +
      '<span class="legenda-quente"> Aquecendo</span>' +
      "</div>";
    return div;
  };
  legenda.addTo(mapa);

  return mapa;
}

export function desenharRegioes(
  mapa: MapaLeaflet,
  regioes: RegiaoMapa[],
  mesReferencia: string,
): CamadaLeaflet {
  const grupo = L.layerGroup().addTo(mapa);

  const rotulo = (regiao: RegiaoMapa) =>
    `<b>${chaveRegiao(regiao.regiao).replace(/^niño/, "Niño")}</b><br>` +
    `Média mensal (${mesReferencia}): ${formatarNumero(regiao.mediaMensal)} °C<br>` +
    `Status: ${statusDe(regiao.mediaMensal)}`;

  for (const regiao of regioes) {
    const bounds = regiao.bounds;
    if (!bounds || !Number.isFinite(Number(regiao.mediaMensal))) continue;

    const cor = corStatus(regiao.mediaMensal);
    const [latMin, latMax] = bounds.lat;

    for (const [lonMin, lonMax] of segmentosDeLongitude(bounds.lon)) {
      L.rectangle(
        [
          [latMin, lonMin],
          [latMax, lonMax],
        ],
        { color: cor, weight: 2, fillColor: cor, fillOpacity: 0.18 },
      )
        .addTo(grupo)
        .bindTooltip(rotulo(regiao), {
          direction: "top",
          className: "rotulo-mapa",
          opacity: 1,
        });
    }
  }

  return grupo;
}
