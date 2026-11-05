export interface Props {
  baseApi: string;
}

export interface Mes2026 {
  zona: string;
  mes: string;
  mesNum: number;
  chuvaMm: number | null;
  climaMm: number | null;
  anomaliaMm: number | null;
  anomaliaPct: number | null;
  maxDiaMm: number | null;
  climaMaxDiaMm: number | null;
  max1hMm: number | null;
  p99HoraMm: number | null;
  diasGe25: number | null;
  nino34: number | null;
}

export interface RespostaCaso2026 {
  ano?: number;
  zonas?: Mes2026[];
}

export type EstadoCaso2026 =
  | { fase: "carregando" }
  | { fase: "erro"; mensagem: string }
  | { fase: "ok"; ano: number; meses: Mes2026[] };
