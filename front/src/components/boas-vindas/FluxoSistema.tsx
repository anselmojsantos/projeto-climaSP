import { ETAPAS } from "./FluxoSistema/etapas";

export default function ComoFunciona() {
  return (
    <section aria-labelledby="como-funciona">
      <h2 id="como-funciona" className="m-0 text-[20px] leading-[1.2] font-semibold">
        Como funciona
      </h2>
      <p className="mt-1.5 mb-0 text-[15px] leading-[1.3] text-ink-secondary">
        Do oceano à decisão na capital — pipeline em 5 etapas.
      </p>

      <ol className="mt-5 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {ETAPAS.map(({ numero, titulo, descricao }) => (
          <li key={numero} className="flex flex-col gap-2 rounded-2xl bg-soft p-3.5">
            <span className="grid size-[26px] place-items-center rounded-full bg-deep text-[13px] font-semibold text-on-dark">
              {numero}
            </span>
            <h3 className="m-0 text-[15px] font-semibold">{titulo}</h3>
            <p className="m-0 text-[14px] leading-[1.45] text-ink-secondary">{descricao}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
