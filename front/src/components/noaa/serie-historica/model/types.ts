export interface Props {
  baseApi: string;
}

export type FaseEnso = "El Niño" | "La Niña" | "Neutro";

export interface PontoSerieHistorica {
  data: string;
  ano: number;
  estacao: string;
  valor: number;
  fase: FaseEnso;
}

export interface RespostaSerieHistorica {
  serie?: PontoSerieHistorica[];
}

export type EstadoSerieHistorica =
  | { fase: "carregando" }
  | { fase: "erro"; mensagem: string }
  | { fase: "ok"; serie: PontoSerieHistorica[] };
