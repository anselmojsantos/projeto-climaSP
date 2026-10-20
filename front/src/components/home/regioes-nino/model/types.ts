import type { ValorNumerico } from "../../lib/formato";
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

export type EstadoRegioes =
  | { fase: "carregando" }
  | { fase: "erro"; mensagem: string }
  | { fase: "ok"; regioes: RegiaoExibicao[]; mesReferencia: string };
