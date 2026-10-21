export interface PontoAjuste {
  x: number;
  y: number;
}

export interface RetaAjustada {
  a: number;
  b: number;
  r2: number;
  rmse: number;
  rmseLoo: number;
}

function ajuste(pontos: PontoAjuste[]): { a: number; b: number } | null {
  const n = pontos.length;
  if (n < 2) return null;

  const mediaX = pontos.reduce((soma, ponto) => soma + ponto.x, 0) / n;
  const mediaY = pontos.reduce((soma, ponto) => soma + ponto.y, 0) / n;

  let sxx = 0;
  let sxy = 0;
  for (const ponto of pontos) {
    sxx += (ponto.x - mediaX) ** 2;
    sxy += (ponto.x - mediaX) * (ponto.y - mediaY);
  }

  if (sxx === 0) return null;

  const a = sxy / sxx;
  return { a, b: mediaY - a * mediaX };
}

/**
 * Mesmo ajuste do notebook (np.polyfit, grau 1) e as métricas da célula de
 * validação: R² e RMSE dentro da amostra e RMSE leave-one-out.
 */
export function ajustarReta(pontos: PontoAjuste[]): RetaAjustada | null {
  const n = pontos.length;
  if (n < 3) return null;

  const reta = ajuste(pontos);
  if (!reta) return null;

  const residuos = pontos.map((ponto) => ponto.y - (reta.a * ponto.x + reta.b));
  const ssRes = residuos.reduce((soma, residuo) => soma + residuo ** 2, 0);
  const mediaY = pontos.reduce((soma, ponto) => soma + ponto.y, 0) / n;
  const ssTot = pontos.reduce((soma, ponto) => soma + (ponto.y - mediaY) ** 2, 0);

  const errosLoo: number[] = [];
  for (let i = 0; i < n; i++) {
    const semOAno = pontos.filter((_, indice) => indice !== i);
    const loo = ajuste(semOAno);
    const alvo = pontos[i];
    if (!loo || !alvo) return null;
    errosLoo.push(alvo.y - (loo.a * alvo.x + loo.b));
  }

  return {
    a: reta.a,
    b: reta.b,
    r2: ssTot > 0 ? 1 - ssRes / ssTot : 0,
    rmse: Math.sqrt(ssRes / n),
    rmseLoo: Math.sqrt(errosLoo.reduce((soma, erro) => soma + erro ** 2, 0) / n),
  };
}
