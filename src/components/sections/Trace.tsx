"use client"

import { automations, tipoHint, tipoLabel, totals, trace, type Tipo } from "@/data/automations"
import { emit, EVT } from "@/lib/site"
import { MaskLine, Page, Reveal, Stamp } from "@/components/ui"

const steps = [
  {
    n: "01",
    title: "Pase",
    line: "La corrida pide un identificador de un solo uso. Sin usuario, sin clave, sin ningún token guardado dentro del ejecutable.",
  },
  {
    n: "02",
    title: "Inicio",
    line: "Queda escrito qué unidad, qué automatización y qué versión acaban de arrancar, y a qué hora.",
  },
  {
    n: "03",
    title: "Fin",
    line: "Se cierra en un finally. Si la herramienta se cae a mitad de camino, el asiento se cierra igual.",
  },
]

const facts = [
  { value: `${trace.audited}/${totals.count}`, label: "registran cada corrida" },
  { value: String(trace.units), label: "repositorios de unidad" },
  { value: String(trace.tipos.length), label: "tipos de arranque en uso" },
  { value: "0", label: "credenciales en el ejecutable" },
]

const tipoCount = (t: Tipo) => automations.filter((a) => a.tipo === t).length

export function Trace() {
  return (
    <section id="trazabilidad" className="relative border-t border-foreground py-28 md:py-40">
      <Page>
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <h2 className="display text-[clamp(3rem,8vw,8rem)] lg:col-span-7">
            <MaskLine inView>Cada ejecución</MaskLine>
            <MaskLine inView delay={0.08}>
              <em>deja asiento.</em>
            </MaskLine>
          </h2>
          <Reveal className="space-y-3 lg:col-span-5 lg:pb-3">
            <div className="kicker">06 — Trazabilidad</div>
            <p className="leading-relaxed text-muted-foreground">
              Una herramienta que nadie puede verificar es un favor, no un activo. Cada una vive en el repositorio de su
              unidad, se entrega con la misma estructura y escribe en el registro central de auditoría cada vez que
              alguien la corre.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-x-16 gap-y-12 lg:grid-cols-12">
          {/* El asiento: tres llamadas, siempre en el mismo orden */}
          <Reveal className="lg:col-span-7">
            <div className="kicker border-b border-foreground pb-3">El asiento</div>
            <ol className="lined">
              {steps.map((st) => (
                <li key={st.n} className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-b border-border py-5">
                  <span className="tabular font-mono text-xs text-accent">{st.n}</span>
                  <div>
                    <div className="font-display text-2xl leading-tight">{st.title}</div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{st.line}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
              <strong className="font-semibold text-foreground">La auditoría nunca bloquea.</strong> Espera cinco
              segundos y, si el registro no responde, la herramienta sigue su camino. Nadie se queda sin trabajar porque
              el log esté caído.
            </p>
          </Reveal>

          {/* Cifras del registro */}
          <Reveal delay={0.1} className="lg:col-span-5">
            <div className="kicker border-b border-foreground pb-3">En números</div>
            <dl>
              {facts.map((f) => (
                <div key={f.label} className="flex items-baseline gap-2 border-b border-border py-4">
                  <dd className="tabular font-mono text-2xl leading-none">{f.value}</dd>
                  <span className="leader" />
                  <dt className="text-sm text-muted-foreground">{f.label}</dt>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex items-start gap-4">
              <Stamp tone="positive" className="mt-0.5 shrink-0">
                Auditada
              </Stamp>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Las dos que faltan son flujos heredados que viven fuera de los repositorios. Entran al registro cuando
                se reconstruyan.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Tipos de ejecución */}
        <Reveal className="mt-20">
          <div className="kicker border-b border-foreground pb-3">Cómo arranca cada una</div>
          <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">
            El nombre de cada carpeta termina en su tipo de ejecución. No dice qué técnicas usa por dentro, solo quién
            la dispara — que es lo que de verdad importa cuando algo falla y hay que saber a quién avisar. La convención
            define cuatro tipos; estas entregas usan {trace.tipos.length}.
          </p>
          {/* auto-fit: la rejilla se ajusta a los tipos que haya, sin celdas vacías */}
          <ul className="mt-8 grid gap-px bg-border [grid-template-columns:repeat(auto-fit,minmax(15rem,1fr))]">
            {trace.tipos.map((t) => (
              <li key={t} className="bg-background">
                <button
                  type="button"
                  onClick={() => emit(EVT.filterTipo, t)}
                  title={`Ver las ${tipoCount(t)} herramientas de tipo ${t}`}
                  className="group flex h-full w-full flex-col items-start gap-2 p-5 text-left transition-colors hover:bg-secondary"
                >
                  <span className="flex w-full items-baseline gap-2">
                    <span className="font-mono text-sm tracking-[0.14em] text-accent">.{t}</span>
                    <span className="leader" />
                    <span className="tabular font-mono text-xs text-muted-foreground">×{tipoCount(t)}</span>
                  </span>
                  <span className="font-display text-xl leading-tight transition-colors group-hover:text-accent">
                    {tipoLabel[t]}
                  </span>
                  <span className="text-[13px] leading-snug text-muted-foreground">{tipoHint[t]}</span>
                </button>
              </li>
            ))}
          </ul>
        </Reveal>
      </Page>
    </section>
  )
}
