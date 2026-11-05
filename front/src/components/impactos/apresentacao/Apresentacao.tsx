export default function Apresentacao() {
  return (
    <section aria-labelledby="impactos-apresentacao" className="max-w-[820px]">
      <p className="m-0 mb-1 text-[11px] uppercase tracking-wide text-ink-secondary">
        Impactos do Niño
      </p>
      <h2
        id="impactos-apresentacao"
        className="m-0 text-[24px] leading-[1.2] font-semibold xl:text-[28px]"
      >
        Do Pacífico para a rua: o que o aquecimento do Niño faz com a chuva de
        São Paulo
      </h2>

      <div className="mt-4 flex flex-col gap-3 text-[15px] leading-[1.5] text-ink-secondary">
        <p className="m-0">
          O El Niño é o aquecimento da água do Pacífico perto da linha do
          Equador. Essa água mais quente evapora mais e mexe com a circulação do
          ar em escala planetária — e São Paulo sente. Este estudo cruzou mais
          de seis décadas de chuva na capital (1961 a 2026) com a temperatura do
          Pacífico para responder três perguntas: chove mais? chove mais forte? e
          o que esperar de 2027?
        </p>
        <p className="m-0">
          A resposta curta: o efeito existe, é modesto no volume e aparece mais
          na pancada. Cada 1 °C de aquecimento do Pacífico adiciona de 4% a 6% ao
          total de chuva do mês e de 5% a 9% ao maior dia. É a diferença entre
          uma chuva que se espalha e uma que se concentra — e a segunda é a que
          alaga.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-soft p-4">
          <p className="m-0 text-[11px] uppercase tracking-wide text-ink-secondary">
            O que foi medido
          </p>
          <p className="mt-1 mb-0 text-[14px] leading-[1.4]">
            Chuva diária e horária em cinco zonas da capital, mês a mês, de 1961
            a setembro de 2026.
          </p>
        </div>
        <div className="rounded-2xl bg-soft p-4">
          <p className="m-0 text-[11px] uppercase tracking-wide text-ink-secondary">
            De onde vêm os dados
          </p>
          <p className="mt-1 mb-0 text-[14px] leading-[1.4]">
            Chuva do ERA5/ERA5-Land (Open-Meteo); temperatura do Pacífico da
            NOAA, na região Niño 3.4.
          </p>
        </div>
        <div className="rounded-2xl bg-soft p-4">
          <p className="m-0 text-[11px] uppercase tracking-wide text-ink-secondary">
            Como ler os gráficos
          </p>
          <p className="mt-1 mb-0 text-[14px] leading-[1.4]">
            "%" é sempre a diferença em relação à média do mesmo mês. "Por °C" é
            o quanto muda a cada 1 °C a mais no Pacífico.
          </p>
        </div>
      </div>
    </section>
  );
}
