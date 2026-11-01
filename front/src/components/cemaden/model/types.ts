export interface Props {
	baseApi: string;
}

export interface Estacao {
	codEstacao: string;
	nomeEstacao: string;
	municipio: string;
	uf: string;
	latitude: number | null;
	longitude: number | null;
	periodo: string;
	nObs: number | null;
	somaMm: number | null;
	mediaMm: number | null;
	horasComLeitura: number | null;
	horasComChuva: number | null;
	horasSemChuva: number | null;
	pctHorasComChuva: number | null;
	pctHorasSemChuva: number | null;
	situacao: string | null;
}

export interface RespostaCemadenMensal {
	periodo?: string;
	totalEstacoes?: number;
	somaTotalMm?: number;
	mediaSomaMm?: number | null;
	estacoesComChuva?: number;
	estacoes?: Estacao[];
}

export interface RespostaCemadenMeses {
	meses?: string[];
}

export interface Ocorrencia {
	id: string;
	dia: string;
	tipo: string;
	local: string;
	zona: string | null;
	latitude: number | null;
	longitude: number | null;
}

export interface OcorrenciaDia {
	dia: string;
	total: number;
}

export interface RespostaOcorrencias {
	total?: number;
	dias?: OcorrenciaDia[];
	ocorrencias?: Ocorrencia[];
}

export type EstadoOcorrencias =
	| { fase: "carregando" }
	| { fase: "erro"; mensagem: string }
	| {
			fase: "ok";
			total: number;
			dias: OcorrenciaDia[];
			ocorrencias: Ocorrencia[];
	  };

export type EstadoMeses =
	| { fase: "carregando" }
	| { fase: "erro"; mensagem: string }
	| { fase: "ok"; meses: string[] };

export type EstadoCemaden =
	| { fase: "carregando" }
	| { fase: "erro"; mensagem: string }
	| {
			fase: "ok";
			periodo: string;
			totalEstacoes: number;
			somaTotalMm: number;
			mediaSomaMm: number | null;
			estacoesComChuva: number;
			estacoes: Estacao[];
	  };