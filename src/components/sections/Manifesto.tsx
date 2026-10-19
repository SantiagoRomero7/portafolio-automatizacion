"use client"

import { ArrowDown } from "lucide-react"
import { roughCount } from "@/data/automations"
import { emit, EVT, useModKey } from "@/lib/site"
import { Page, Reveal } from "@/components/ui"

export function Manifesto() {
  const mod = useModKey()

  return (
    <section aria-label="Presentación" className="relative py-24 md:py-36">
      <Page className="grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-3">
          <div className="kicker">Nota del autor</div>
          <div className="mt-3 h-px w-12 bg-accent" />
        </Reveal>
        <div className="lg:col-span-9">
          <Reveal>
            <p className="display text-[clamp(1.9rem,3.8vw,3.6rem)] leading-[1.04]">
              Trabajo en Cajasan con las áreas de soporte estratégico. Me siento con los equipos, encuentro dónde se les
              va el día y construyo la herramienta que se los devuelve.{" "}
              <span className="text-muted-foreground">Llevo {roughCount} entregadas.</span>
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <p className="max-w-lg leading-relaxed text-muted-foreground">
              Ningún número de esta página es decorativo. Todos salen del registro de entregas, con los tiempos que
              reportó cada área, y donde un proceso sigue en mejora, lo dice.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#archivo" className="btn btn-solid">
                Abrir el archivo <ArrowDown />
              </a>
              <button type="button" onClick={() => emit(EVT.openIndex)} className="btn">
                Índice · {mod} K
              </button>
            </div>
          </Reveal>
        </div>
      </Page>
    </section>
  )
}
