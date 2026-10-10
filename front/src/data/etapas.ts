/** Pipeline do estudo, do oceano à previsão na capital. */
export interface Etapa {
  numero: string;
  titulo: string;
  descricao: string;
}

export const ETAPAS: Etapa[] = [
  {
    numero: "1",
    titulo: "Ingestão ao vivo",
    descricao: "Buscadores conectados a NOAA, INMET, ANA e CEMADEN.",
  },
  {
    numero: "2",
    titulo: "PostgreSQL (Render)",
    descricao: "Dados brutos normalizados e versionados.",
  },
  {
    numero: "3",
    titulo: "ETL / ELT",
    descricao: "Limpeza, agregação e anomalias vs a média.",
  },
  {
    numero: "4",
    titulo: "Correlação e inferência",
    descricao: "Ensaio Pacífico × clima de SP (ONI, chuva, temperatura).",
  },
  {
    numero: "5",
    titulo: "Modelo de ML",
    descricao:
      "SARIMA / florestas / LSTM preveem chuva forte, calor e estiagem.",
  },
];