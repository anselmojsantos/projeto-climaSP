import BemVindos from "./BemVindos";
import CardElNino from "./CardElNino";
import FontesDeDados from "./FontesDeDados";
import RegioesNino from "./RegioesNino";
import ComoFunciona from "./FluxoSistema";

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
        <ComoFunciona />
      </div>
    </>
  );
}
