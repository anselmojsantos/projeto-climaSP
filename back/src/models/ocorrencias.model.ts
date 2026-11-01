import { pool } from "../config/pool.js";

export interface OcorrenciaRow {
	cd_identificador: string;
	dt_ocorrencia: string;
	dc_tipo_ocorrencia: string;
	nm_subprefeitura: string | null;
	zona: string | null;
	latitude: number | null;
	longitude: number | null;
}

/**
 * Ocorrências de alagamento/inundação da Defesa Civil (SIGRC).
 *
 * A base tem ~600 linhas: devolver tudo numa chamada é mais simples do que
 * filtrar por dia no banco e ainda permite trocar de data sem novo request.
 */
export async function FindOcorrencias(): Promise<OcorrenciaRow[]> {
	const { rows } = await pool.query<OcorrenciaRow>(
		`
		 SELECT "cd_identificador"::text AS "cd_identificador",
		        "dt_ocorrencia",
		        "dc_tipo_ocorrencia",
		        "nm_subprefeitura",
		        "zona",
		        "latitude",
		        "longitude"
		 FROM df_ocorrencias
		 ORDER BY "dt_ocorrencia" DESC, "cd_identificador"
		`,
	);
	return rows;
}
