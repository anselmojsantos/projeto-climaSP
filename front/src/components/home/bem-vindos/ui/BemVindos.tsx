const RONI_URL = "https://www.cpc.ncep.noaa.gov/data/indices/RONI.ascii.txt";

const RONI_PAGINA_URL =
  "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/roni/";

const TSM_SEMANAL_URL =
  "https://cpc.ncep.noaa.gov/data/indices/rel_wksst9120.txt";

const NOTA_FONTES =
  "Fontes: NOAA/CPC (índices Niño — atualização semanal) · INMET (chuva/temperatura SP) · ANA (hidrologia) · CEMADEN (710 estações de alerta)";

export default function BemVindos() {
  return (
    <div>
      <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-ink-secondary xl:text-[17px]">
        Bem-vindo ao ClimaSP. Este é um projeto de estudo de caso do Projeto
        Integrado IV da Univesp, criado para compreender os fenômenos do El Niño a
        partir de dados reais e públicos, disponíveis em agências oficiais como a
        NOAA.
      </p>

      <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-ink-secondary xl:text-[17px]">
        O foco está em investigar a correlação entre os impactos do fenômeno e as
        diferentes sub-regiões da Região Metropolitana de São Paulo, combinando
        projeção e técnicas de Machine Learning.
      </p>

      <p className="mt-5 mb-0 text-[13px] leading-[1.4] text-data-neutral xl:text-[14px]">
        {NOTA_FONTES}{" "}
        <a className=
          "underline underline-offset-2 transition-colors hover:text-accent"
          href={RONI_URL}
          target="_blank"
          rel="noopener noreferrer">
          NOAA/CPC — RONI (ASCII)
        </a>
        {" · "}
        <a className=
          "underline underline-offset-2 transition-colors hover:text-accent"
          href={RONI_PAGINA_URL}
          target="_blank"
          rel="noopener noreferrer">
          NOAA/CPC — página do RONI
        </a>
        {" · "}
        <a className=
          "underline underline-offset-2 transition-colors hover:text-accent"
          href={TSM_SEMANAL_URL}
          target="_blank"
          rel="noopener noreferrer">
          NOAA/CPC — TSM semanal (relativa)
        </a>
      </p>
    </div>
  );
}
