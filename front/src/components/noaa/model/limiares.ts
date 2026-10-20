export const LIMIAR_EL_NINO = 0.5;
export const LIMIAR_LA_NINA = -0.5;
export const PASSO_EIXO = 0.5;

export const CORES_FASE = {
  "El Niño": {
    ponto: "fill-data-warm",
    traco: "stroke-data-warm",
    legenda: "bg-data-warm",
  },
  "La Niña": {
    ponto: "fill-data-cold",
    traco: "stroke-data-cold",
    legenda: "bg-data-cold",
  },
  Neutro: {
    ponto: "fill-data-neutral",
    traco: "stroke-data-neutral",
    legenda: "bg-data-neutral",
  },
} as const;

export const FASE_NEUTRA = {
  ponto: "fill-data-neutral",
  traco: "stroke-data-neutral",
  legenda: "bg-data-neutral",
};
