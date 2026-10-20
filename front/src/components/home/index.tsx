import BemVindos from "./bem-vindos";
import CardElNino from "./card-el-nino";
import FontesDeDados from "./fontes-de-dados";
import RegioesNino from "./regioes-nino";
import FluxoSistema from "./fluxo-sistema";

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

      <FontesDeDados />

      <div className="mt-12">
        <RegioesNino baseApi={baseApi} />
      </div>

      <div className="mt-12">
        <FluxoSistema />
      </div>
    </>
  );
}
