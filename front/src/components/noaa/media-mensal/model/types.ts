export interface Props {
  baseApi: string;
}

export interface RegiaoMediaMensal {
  chave: string;
  nome: string;
}

export interface PontoMediaMensal {
  mes: string;
  rotulo: string;
  nino12: number | null;
  nino3: number | null;
  nino34: number | null;
  nino4: number | null;
}

export interface RespostaMediaMensal {
  ano?: number;
  regioes?: RegiaoMediaMensal[];
  serie?: PontoMediaMensal[];
}

export type EstadoMediaMensal =
  | { fase: "carregando" }
  | { fase: "erro"; mensagem: string }
  | {
      fase: "ok";
      ano: number;
      regioes: RegiaoMediaMensal[];
      serie: PontoMediaMensal[];
    };
