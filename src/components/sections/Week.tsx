"use client"

import { useRef, useState } from "react"
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion"
import { areaColor, automations, totals } from "@/data/automations"
import { fmtDur } from "@/lib/format"
import { Page, Stamp } from "@/components/ui"
import { cn } from "@/lib/utils"

const DAY = 480 // jornada de 8 h, en minutos
const WEEKDAYS = ["L", "M", "X", "J", "V"]
const WORDS = ["Cero", "Una", "Dos", "Tres", "Cuatro", "Cinco", "Seis", "Siete"]

// Las tareas más largas primero: la primera semana entera es una sola tarea
const ordered = [...automations].sort((a, b) => b.beforeMin - a.beforeMin)
const N = ordered.length

type Segment = { idx: number; day: number; start: number; len: number; first: boolean }

// Reparte las tareas en jornadas como texto que salta de línea
const segmentsByDay: Segment[][] = (() => {
  const out: Segment[][] = []
  let cursor = 0
  ordered.forEach((a, idx) => {
    let rest = a.beforeMin
    let first = true
    while (rest > 0.001) {
      const day = Math.floor(cursor / DAY)
      const start = cursor - day * DAY
      const len = Math.min(rest, DAY - start)
      ;(out[day] ??= []).push({ idx, day, start, len, first })
      first = false
      cursor += len
      rest -= len
    }
  })
  return out
})()

const usedDays = segmentsByDay.length
const weeks = Math.ceil(usedDays / 5)
const fullWeeks = Math.floor(totals.beforeMin / (DAY * 5))

/** Minutos humanos que quedan cuando se han automatizado k tareas (k continuo) */
function remaining(k: number) {
  return ordered.reduce((acc, a, i) => {
    const t = Math.min(Math.max(k - i, 0), 1)
    return acc + a.beforeMin + (a.afterMin - a.beforeMin) * t
  }, 0)
}

export function Week() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const k = useTransform(scrollYProgress, [0.06, 0.86], [0, N])
  const remainingText = useTransform(k, (v) => fmtDur(remaining(v)))

  const [done, setDone] = useState(0)
  useMotionValueEvent(k, "change", (v) => setDone(Math.floor(v + 1e-4)))

  const finished = done >= N
  const current = ordered[Math.min(done, N - 1)]

  const counter = (
    <div className="border-t border-border pt-4">
      <div className="kicker">Tiempo manual restante</div>
      <motion.div className="tabular mt-2 font-mono text-[clamp(2rem,4.4vw,4.1rem)] leading-none tracking-[-0.04em]">
        {remainingText}
      </motion.div>
      <div className="mt-4 min-h-[4.75rem]">
        <AnimatePresence mode="wait" initial={false}>
          {finished ? (
            <motion.div key="fin" initial={{ opacity: 0, scale: 1.6 }} animate={{ opacity: 1, scale: 1 }} className="inline-block -rotate-3">
              <Stamp size="lg">Comprimido</Stamp>
            </motion.div>
          ) : (
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="kicker text-[10px]">
                Automatizando {String(done + 1).padStart(2, "0")} / {N}
              </div>
              <div className="mt-1 font-display text-xl leading-tight">{current.name}</div>
              <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                {current.area} · <s className="decoration-accent">{current.before}</s> → {current.after}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )

  return (
    <section id="semana" ref={ref} className="on-panel relative h-[460svh]">
      <p className="sr-only">
        La suma de una ejecución de cada una de las {N} herramientas equivale a {fmtDur(totals.beforeMin)} de
        trabajo manual; automatizadas requieren {fmtDur(totals.afterMin)} de atención humana.
      </p>
      <div className="sticky top-0 h-svh overflow-hidden" aria-hidden>
        <Page className="grid h-full grid-rows-[auto_1fr] gap-6 pb-6 pt-20 lg:grid-cols-12 lg:grid-rows-1 lg:gap-12 lg:pb-10 lg:pt-24">
          <div className="flex flex-col lg:col-span-4">
            <div className="kicker">01 — La cuenta</div>
            <h2 className="display mt-4 text-[clamp(2.1rem,4.3vw,4.4rem)]">
              {WORDS[fullWeeks]} semanas de trabajo manual<span className="text-accent">.</span>
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {finished ? (
                <>
                  Ahora caben en <strong className="text-foreground">{fmtDur(totals.afterMin)}</strong> de atención
                  humana. El resto lo hacen las herramientas.
                </>
              ) : (
                <>
                  Así se ven, sumadas, las {N} tareas antes de automatizarlas. Cada fila es una jornada de 8 horas.
                </>
              )}
            </p>
            <div className="mt-auto hidden lg:block">{counter}</div>
          </div>

          <div className="flex min-h-0 flex-col justify-center gap-5 lg:col-span-8">
            <div className="grid grid-cols-2 gap-x-5 gap-y-5 sm:gap-x-10 lg:gap-y-8">
              {Array.from({ length: weeks }, (_, w) => (
                <div key={w}>
                  <div className="kicker mb-2 flex justify-between text-[10px]">
                    <span>Semana {w + 1}</span>
                    <span className="hidden sm:inline">8 h / día</span>
                  </div>
                  <div className="space-y-1.5">
                    {WEEKDAYS.map((label, d) => {
                      const day = w * 5 + d
                      const segs = segmentsByDay[day] ?? []
                      return (
                        <div key={label} className="flex items-center gap-2">
                          <span className="w-3 font-mono text-[10px] text-muted-foreground">{label}</span>
                          <div
                            className={cn(
                              "relative h-3.5 flex-1 outline outline-1 outline-border sm:h-5",
                              day >= usedDays && "opacity-40",
                            )}
                            style={{
                              backgroundImage:
                                "repeating-linear-gradient(to right, transparent 0 calc(12.5% - 1px), var(--border) calc(12.5% - 1px) 12.5%)",
                            }}
                          >
                            {segs.map((seg) => (
                              <Block key={`${seg.idx}-${seg.day}`} seg={seg} done={done} />
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <p className="kicker text-[10px] leading-relaxed normal-case tracking-[0.06em]">
              Suma de una ejecución de cada herramienta, con los tiempos reportados por las áreas. Varias corren cada
              mes, cada quincena o cada día.
            </p>
            <div className="lg:hidden">{counter}</div>
          </div>
        </Page>
      </div>
    </section>
  )
}

function Block({ seg, done }: { seg: Segment; done: number }) {
  const a = ordered[seg.idx]
  const automated = seg.idx < done
  const active = seg.idx === done
  return (
    <div
      className="absolute inset-y-0 px-px"
      style={{ left: `${(seg.start / DAY) * 100}%`, width: `${(seg.len / DAY) * 100}%` }}
    >
      <div
        className={cn("h-full w-full transition-all duration-700 ease-out", active && "animate-pulse")}
        style={{
          backgroundColor: automated ? "transparent" : areaColor[a.area],
          boxShadow: automated ? "inset 0 0 0 1px var(--border)" : "none",
          transform: automated ? "scaleY(0.3)" : "scaleY(1)",
        }}
      />
      {automated && seg.first && <span className="absolute inset-y-0 left-px w-[2px] bg-accent" />}
    </div>
  )
}
