export type ValorNumerico = number | string | null;

const AUSENTE = "—";

export function formatarNumero(valor: ValorNumerico | undefined): string {
  if (valor === null || valor === undefined || valor === "") return AUSENTE;
  const numero = Number(valor);
  return Number.isFinite(numero)
    ? new Intl.NumberFormat("pt-BR", {
        signDisplay: "always",
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(numero)
    : AUSENTE;
}

export function formatarPercentual(valor: ValorNumerico | undefined): string {
  if (valor === null || valor === undefined || valor === "") return AUSENTE;
  const numero = Number(valor);
  return Number.isFinite(numero)
    ? new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2,
      }).format(numero)
    : AUSENTE;
}

export function formatarData(valor: string | null | undefined): string {
  if (!valor) return AUSENTE;
  const data = new Date(`${valor}T00:00:00`);
  return Number.isNaN(data.getTime())
    ? valor
    : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(data);
}

// Temporadas ENSO são janelas de 3 meses; mostramos o mês central (ex.: JAS → agosto).
const MESES_ABREVIADOS = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

const CENTRO_TEMPORADA: Record<string, number | undefined> = {
  DJF: 0, JFM: 1, FMA: 2, MAM: 3, AMJ: 4, MJJ: 5,
  JJA: 6, JAS: 7, ASO: 8, SON: 9, OND: 10, NDJ: 11,
};

export function rotuloCentroTemporada(
  temporada: string | null,
  ano: ValorNumerico | undefined,
): string {
  const indice = CENTRO_TEMPORADA[String(temporada ?? "").toUpperCase()];
  if (indice === undefined) return AUSENTE;
  const mes = MESES_ABREVIADOS[indice] ?? "";
  return `${mes.charAt(0).toUpperCase()}${mes.slice(1)}/${String(ano ?? "").slice(-2)}`;
}
