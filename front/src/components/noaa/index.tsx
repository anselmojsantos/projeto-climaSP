import Analogos2026 from "./analogos-2026";
import MediaMensal from "./media-mensal";
import Roni2026 from "./roni-2026";

interface Props {
  baseApi: string;
}

export default function Noaa({ baseApi }: Props) {
  return (
    <>
      <div className="grid gap-x-4 gap-y-8 2xl:grid-cols-2 2xl:items-start">
        <div className="min-w-0">
          <MediaMensal baseApi={baseApi} />
        </div>
        <div className="min-w-0">
          <Analogos2026 baseApi={baseApi} />
        </div>
        <div className="min-w-0">
          <Roni2026 baseApi={baseApi} />
        </div>
      </div>
    </>
  );
}
