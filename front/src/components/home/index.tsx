import BemVindos from "./bem-vindos/BemVindos";
import CardElNino from "./card-el-nino/CardElNino";
import FontesDeDados from "./fontes-de-dados/FontesDeDados";
import RegioesNino from "./regioes-nino/RegioesNino";
import FluxoSistema from "./fluxo-sistema/FluxoSistema";

interface Props {
  baseApi: string;
}

export default function BoasVindas({ baseApi }: Props) {
  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[1fr_440px] xl:items-center xl:gap-6">
        <BemVindos />

        <CardElNino baseApi={baseApi} />
      </div>

      <div className="mt-12">
        <FontesDeDados />
      </div>

      <div className="mt-12">
        <RegioesNino baseApi={baseApi} />
      </div>

      <div className="mt-12">
        <FluxoSistema />
      </div>
    </>
  );
}
