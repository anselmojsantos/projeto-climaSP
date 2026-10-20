import { FONTES } from "../model/fontes";

/** Seção "Fontes de dados": um card por agência, com a cadência de atualização. */
export default function FontesDeDados() {
  return (
    <section aria-labelledby="fontes-dados">
      <h2 id="fontes-dados" className="m-0 text-[20px] leading-[1.2] font-semibold">
        Fontes de dados
      </h2>
      <p className="mt-1.5 mb-0 text-[15px] leading-[1.3] text-ink-secondary">
        O que alimenta o estudo e com que cadência.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {FONTES.map(({ nome, descricao, cadencia }) => (
          <article key={nome} className="flex flex-col gap-2 rounded-2xl bg-soft p-4">
            <h3 className="m-0 text-[15px] leading-[1.25] font-semibold">{nome}</h3>
            <p className="m-0 text-[14px] leading-[1.45] text-ink-secondary">{descricao}</p>
            <span className="mt-auto w-fit rounded-full bg-bg px-1.5 py-1.5 text-[12px] text-data-neutral">
              {cadencia}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
