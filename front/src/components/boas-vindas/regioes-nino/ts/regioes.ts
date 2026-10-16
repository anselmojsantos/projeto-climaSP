export interface BoundsRegiao {
  lat: [number, number];
  lon: [number, number];
}

export interface RegiaoNino {
  regiao: string;
  localizacao: string;
  percentualElNino: number;
  mediaAnomalia: number;
  mediaMensal: number;
  guia?: boolean;
  bounds: BoundsRegiao;
}

export const MES_MENSAL = "set/2026";

export const REGIOES_NINO: RegiaoNino[] = [
  {
    regiao: "★ Niño 1+2",
    localizacao: "0°–10° Sul · 90°W–80°W · Costa do Peru",
    percentualElNino: 86.11,
    mediaAnomalia: 1.63,
    mediaMensal: 3.8,
    guia: true,
    bounds: { lat: [-10, 0], lon: [-90, -80] },
  },
  {
    regiao: "Niño 3",
    localizacao: "5°N–5°S · 150°W–90°W · Pacífico Leste",
    percentualElNino: 52.78,
    mediaAnomalia: 0.72,
    mediaMensal: 2.75,
    bounds: { lat: [-5, 5], lon: [-150, -90] },
  },
  {
    regiao: "Niño 3.4",
    localizacao: "5°N–5°S · 170°W–120°W · Pacífico Centro-Leste",
    percentualElNino: 47.22,
    mediaAnomalia: 0.43,
    mediaMensal: 1.9,
    bounds: { lat: [-5, 5], lon: [-170, -120] },
  },
  {
    regiao: "Niño 4",
    localizacao: "5°N–5°S · 160°E–150°W · Pacífico Centro-Oeste",
    percentualElNino: 36.11,
    mediaAnomalia: 0.2,
    mediaMensal: 0,
    bounds: { lat: [-5, 5], lon: [160, 210] },
  },
];

export const LEGENDA_REGIOES =
  "Regiões Niño 1+2 · 3 · 3.4 · 4 — coleta das anomalias do período (07/01 a 09/09/2026).";
