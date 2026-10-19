"use client"

import { areas } from "@/data/automations"
import { MaskLine, Page, Reveal } from "@/components/ui"

const principles = [
  {
    title: "Primero lo hago a mano.",
    text: "Antes de escribir código repito el proceso con los archivos reales. Las reglas que nadie escribió aparecen en la tercera fila.",
  },
  {
    title: "Si no lo usan, no existe.",
    text: "Interfaz clara, un .exe y nada que instalar. Una herramienta que el área no adopta es solo un script en mi carpeta.",
  },
  {
    title: "Nunca sin respaldo.",
    text: "Antes de tocar una maestra de un millón de filas, se hace una copia. Siempre, aunque parezca innecesario.",
  },
]

export function About() {
  return (
    <section id="sobre-mi" className="on-panel relative py-28 md:py-40">
      <Page>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="kicker">07 — Sobre mí</div>
            <blockquote className="display mt-6 text-[clamp(2.5rem,5.8vw,5.75rem)]">
              <MaskLine inView>La automatización</MaskLine>
              <MaskLine inView delay={0.08}>no reemplaza personas.</MaskLine>
              <MaskLine inView delay={0.16}>
                <em className="text-accent">Les devuelve el tiempo.</em>
              </MaskLine>
            </blockquote>
          </div>
          <Reveal className="space-y-6 leading-relaxed lg:col-span-5 lg:pt-14">
            <p>
              Soy <strong>Santiago Romero</strong>, desarrollador de automatizaciones en <strong>Cajasan</strong>, en
              Bucaramanga. Trabajo con las áreas de soporte estratégico: me siento con los equipos, entiendo dónde se
              les va el día y construyo la herramienta que se los devuelve.
            </p>
            <p className="text-muted-foreground">
              No hago demos para una presentación. Hago ejecutables que alguien abre un lunes a las ocho de la mañana y
              que tienen que funcionar sin mí al lado.
            </p>
            <div className="border-t border-border pt-5">
              <div className="kicker mb-3">Algunas de las áreas con las que trabajo</div>
              <p className="font-display text-xl leading-snug">
                {areas.join(" · ")} <em className="text-muted-foreground">y contando.</em>
              </p>
            </div>
          </Reveal>
        </div>

        <div className="mt-20 grid gap-px bg-border md:grid-cols-3">
          {principles.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08} className="bg-background p-6 md:p-8">
              <div className="font-mono text-xs text-accent">Regla {String(i + 1).padStart(2, "0")}</div>
              <h3 className="display mt-4 text-3xl leading-[1.02]">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
            </Reveal>
          ))}
        </div>
      </Page>
    </section>
  )
}
