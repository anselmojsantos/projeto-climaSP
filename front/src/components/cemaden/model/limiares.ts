/** Cortes de cor para soma_mm (mm) no mapa. */
export const CORTES_SOMA_MM = [0, 10, 30, 60, 100, 200] as const;

/** Raio mínimo/máximo do ponto (px no viewBox). */
export const RAIO_MIN = 4;
export const RAIO_MAX = 14;

/** Limites geográficos do recorte de São Paulo para a projeção. */
export const BOUNDS_SP = {
	latMin: -24.5,
	latMax: -23.0,
	lonMin: -47.2,
	lonMax: -46.0,
} as const;

/** Grade do heatmap espacial: colunas × linhas sobre BOUNDS_SP. */
export const HEATMAP_COLUNAS = 12;
export const HEATMAP_LINHAS = 14;

/** Cor da célula do heatmap sem nenhuma estação com leitura. */
export const COR_CELULA_VAZIA = "#f1f5f9";