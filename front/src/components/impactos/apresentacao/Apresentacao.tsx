export default function Apresentacao() {
  return (
    <section aria-labelledby="impactos-apresentacao" className="max-w-[900px]">
      <p className="m-0 mb-1 text-[11px] uppercase tracking-wide text-ink-secondary">
        Impactos do Niño
      </p>
      <h2
        id="impactos-apresentacao"
        className="m-0 text-[24px] leading-[1.2] font-semibold xl:text-[30px]"
      >
        O que o aquecimento do Pacífico muda na chuva de São Paulo
      </h2>

      <div className="mt-4 flex flex-col gap-3 text-[16px] leading-[1.55] text-ink-secondary">
        <p className="m-0">
          O El Niño é o aquecimento da água do Pacífico perto da linha do
          Equador. Essa água mais quente muda a circulação do ar e mexe com a
          chuva em várias partes do mundo. São Paulo sente.
        </p>
        <p className="m-0">
          Para medir o efeito por aqui, juntamos 65 anos de chuva na capital
          (janeiro de 1961 a setembro de 2026) com a temperatura do Pacífico na
          região Niño 3.4. A pergunta era simples: quando o Pacífico esquenta,
          chove mais? Chove mais forte? E o que isso indica para os próximos
          meses?
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-data-neutral/20 bg-soft p-4">
        <p className="m-0 text-[11px] uppercase tracking-wide text-ink-secondary">
          Em resumo
        </p>
        <p className="mt-1 mb-0 text-[16px] leading-[1.5]">
          Cada 1 °C a mais no Pacífico está associado a cerca de 5% mais chuva
          no mês e 7% mais chuva no dia mais chuvoso. É um efeito pequeno, mas
          que aparece nos 65 anos de dados. Em setembro de 2026, com o Pacífico
          2,1 °C acima do normal, choveu cerca de 2,7 vezes o normal do mês.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-soft p-4">
          <p className="m-0 text-[11px] uppercase tracking-wide text-ink-secondary">
            A chuva
          </p>
          <p className="mt-1 mb-0 text-[14px] leading-[1.45]">
            ERA5-Land (diária, grade de ~11 km) e ERA5 (horária, ~28 km), via
            Open-Meteo. Cinco zonas da capital: Centro, Leste, Norte, Oeste e
            Sul.
          </p>
        </div>
        <div className="rounded-2xl bg-soft p-4">
          <p className="m-0 text-[11px] uppercase tracking-wide text-ink-secondary">
            O Pacífico
          </p>
          <p className="mt-1 mb-0 text-[14px] leading-[1.45]">
            Anomalia mensal do Niño 3.4, da NOAA. É a diferença entre a
            temperatura da água e a média de longo prazo.
          </p>
        </div>
        <div className="rounded-2xl bg-soft p-4">
          <p className="m-0 text-[11px] uppercase tracking-wide text-ink-secondary">
            O período
          </p>
          <p className="mt-1 mb-0 text-[14px] leading-[1.45]">
            Chuva de janeiro de 1961 a setembro de 2026, mês a mês. A normal de
            referência usa os anos de 1991 a 2020.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-data-neutral/20 p-4">
        <p className="m-0 text-[11px] uppercase tracking-wide text-ink-secondary">
          Como ler
        </p>
        <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-[14px] leading-[1.45] text-ink-secondary">
          <li>
            <strong className="font-semibold text-ink">Normal</strong>: média de
            cada mês entre 1991 e 2020. É a referência para dizer se um mês
            choveu acima ou abaixo do esperado.
          </li>
          <li>
            <strong className="font-semibold text-ink">%</strong>: diferença em
            relação a essa normal.
          </li>
          <li>
            <strong className="font-semibold text-ink">°C</strong>: quanto o
            Pacífico está acima ou abaixo do normal.
          </li>
          <li>
            <strong className="font-semibold text-ink">por °C</strong>: quanto a
            chuva muda a cada 1 °C a mais.
          </li>
        </ul>
      </div>
    </section>
  );
}
