export const AUSENTE = "—";

export function formatarDecimal(
  valor: number | null | undefined,
  casas = 1,
): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) {
    return AUSENTE;
  }
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

/** Número com sinal explícito: "+11,6" / "−2,2". */
export function formatarComSinal(valor: number | null | undefined, casas = 1): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) {
    return AUSENTE;
  }
  const sinal = valor < 0 ? "−" : "+";
  return `${sinal}${formatarDecimal(Math.abs(valor), casas)}`;
}

/** Percentual com sinal: "+14,0%". */
export function formatarPercentualSinal(
  valor: number | null | undefined,
  casas = 1,
): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) {
    return AUSENTE;
  }
  return `${formatarComSinal(valor, casas)}%`;
}

export function formatarMm(valor: number | null | undefined, casas = 1): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) {
    return AUSENTE;
  }
  return `${formatarDecimal(valor, casas)} mm`;
}

export const MESES_CURTOS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
] as const;

export function rotuloMes(mesNum: number): string {
  return MESES_CURTOS[mesNum - 1] ?? "";
}

export const MESES_LONGOS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
] as const;

/** "1961-01" → "janeiro de 1961". */
export function rotuloMesLongo(mes: string): string {
  const [ano = "", mesTexto = ""] = mes.split("-");
  const mesNum = Number.parseInt(mesTexto, 10);
  const nome = MESES_LONGOS[mesNum - 1];
  return nome ? `${nome} de ${ano}` : mes;
}

/** "1961-01" → "jan/1961". */
export function rotuloMesAno(mes: string): string {
  const [ano = "", mesTexto = ""] = mes.split("-");
  const mesNum = Number.parseInt(mesTexto, 10);
  return `${rotuloMes(mesNum)}/${ano}`;
}
