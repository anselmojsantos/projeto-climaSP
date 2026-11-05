export interface Props {
  baseApi: string;
}

export interface MetricaIntensidade {
  chave: string;
  nome: string;
  unidade: string;
  coef: number | null;
  pct: number | null;
  fator: number | null;
  p: number | null;
}

export interface ZonaIntensidade {
  zona: string;
  metricas: MetricaIntensidade[];
}

export interface RespostaIntensidade {
  zonas?: ZonaIntensidade[];
}

export type EstadoIntensidade =
  | { fase: "carregando" }
  | { fase: "erro"; mensagem: string }
  | { fase: "ok"; zonas: ZonaIntensidade[] };
