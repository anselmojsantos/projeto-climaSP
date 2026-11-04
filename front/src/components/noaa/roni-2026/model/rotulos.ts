export interface MarcadorTemporada {
  temporada: string;
  ano: number | null;
}

function anoCurto(ano: number): string {
  return String(ano).slice(-2);
}

/** "SON a JFM" ou "SON/2026 a JFM/2027" quando o intervalo cruza o ano. */
export function formatoIntervalo(itens: MarcadorTemporada[]): string {
  if (itens.length === 0) return "";

  const primeiro = itens[0]!;
  const ultimo = itens[itens.length - 1]!;
  const cruzaAno =
    primeiro.ano !== null && ultimo.ano !== null && primeiro.ano !== ultimo.ano;

  if (!cruzaAno) return `${primeiro.temporada} a ${ultimo.temporada}`;
  return `${primeiro.temporada}/${primeiro.ano} a ${ultimo.temporada}/${ultimo.ano}`;
}

/** Rótulo curto do eixo: acrescenta o ano (2 dígitos) quando ele muda. */
export function rotuloEixo(
  ponto: MarcadorTemporada,
  anoBase: number | null,
): string {
  if (ponto.ano === null || anoBase === null || ponto.ano === anoBase) {
    return ponto.temporada;
  }
  return `${ponto.temporada}/${anoCurto(ponto.ano)}`;
}

/** "SON, OND, NDJ, DJF e JFM" */
export function listaTemporadas(itens: MarcadorTemporada[]): string {
  const nomes = itens.map((item) => item.temporada);

  if (nomes.length === 0) return "";
  if (nomes.length === 1) return nomes[0]!;
  return `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;
}
