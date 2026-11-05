import Apresentacao from "./apresentacao/Apresentacao";
import Fases from "./fases";
import Historico from "./historico";
import Intensidade from "./intensidade";
import Projecao from "./projecao";

interface Props {
  baseApi: string;
}

export default function Impactos({ baseApi }: Props) {
  return (
    <div className="max-w-[1040px]">
      <Apresentacao />

      <div className="mt-12 flex flex-col gap-14">
        <Historico baseApi={baseApi} />
        <Fases baseApi={baseApi} />
        <Intensidade baseApi={baseApi} />
        <Projecao baseApi={baseApi} />
      </div>
    </div>
  );
}
