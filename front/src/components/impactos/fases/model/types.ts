export interface Props {
  baseApi: string;
}

export interface FaseResumo {
  fase: string;
  meses: number;
  anomaliaPct: number | null;
  min: number | null;
  max: number | null;
}

export interface RespostaFases {
  de?: number | null;
  ate?: number | null;
  primeiroMes?: string | null;
  ultimoMes?: string | null;
  mesesPorZona?: number | null;
  fases?: FaseResumo[];
}

export type EstadoFases =
  | { fase: "carregando" }
  | { fase: "erro"; mensagem: string }
  | {
      fase: "ok";
      primeiroMes: string | null;
      ultimoMes: string | null;
      mesesPorZona: number | null;
      fases: FaseResumo[];
    };
