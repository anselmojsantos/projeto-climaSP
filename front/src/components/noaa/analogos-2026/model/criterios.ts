export interface CriterioAnalogos {
  nome: string;
  limiar: string;
  mede: string;
}

export const CRITERIOS_ANALOGOS: CriterioAnalogos[] = [
  {
    nome: "Forma da curva (r)",
    limiar: "≥ 0,90",
    mede: "semelhança de forma entre as curvas",
  },
  {
    nome: "Erro médio (RMSE)",
    limiar: "≤ 0,75 °C",
    mede: "distância média entre as curvas",
  },
  {
    nome: "Trimestres divergentes",
    limiar: "≤ 5",
    mede: "trimestres que diferem mais de 0,5 °C",
  },
  {
    nome: "Amplitude",
    limiar: "≥ 0,60 °C",
    mede: "range do ano; descarta curva achatada",
  },
];
