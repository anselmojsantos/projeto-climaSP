import Apresentacao from "./apresentacao/Apresentacao";
import Caso2026 from "./caso-2026";
import Cenario from "./cenario";
import Concentracao from "./concentracao";
import Fases from "./fases";
import Intensidade from "./intensidade";

interface Props {
  baseApi: string;
}

export default function Impactos({ baseApi }: Props) {
  return (
    <>
      <Apresentacao />

      <div className="mt-10 flex flex-col gap-12">
        <div className="grid gap-x-6 gap-y-12 2xl:grid-cols-2 2xl:items-start">
          <div className="min-w-0">
            <Fases baseApi={baseApi} />
          </div>
          <div className="min-w-0">
            <Intensidade baseApi={baseApi} />
          </div>
        </div>

        <Concentracao baseApi={baseApi} />
        <Cenario baseApi={baseApi} />
        <Caso2026 baseApi={baseApi} />
      </div>
    </>
  );
}
