import type { ValorNumerico } from "../../libs/formato";
import type { BoundsRegiao } from "./regioes";

export interface Props {
  baseApi: string;
}

export interface RegiaoExibicao {
  regiao: string;
  localizacao: string;
  percentualElNino: ValorNumerico;
  mediaAnomalia: ValorNumerico;
  mediaMensal: ValorNumerico;
  guia?: boolean;
  bounds?: BoundsRegiao | null;
}

export interface RespostaRegioes {
  regioes?: RegiaoExibicao[];
  mesReferencia?: string;
}
