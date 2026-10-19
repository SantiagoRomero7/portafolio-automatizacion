"use client"

import Image from "next/image"
import { useRef, useState } from "react"
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion"
import { roughCount } from "@/data/automations"
import { clock } from "@/lib/format"
import { EASE, MaskLine, Page, Stamp } from "@/components/ui"
import { cn } from "@/lib/utils"

// Caso real (herramienta n.º 1): ~1 semana laboral → 15 segundos
const START = 40 * 3600
const END = 15

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })

  const progress = useTransform(scrollYProgress, [0.04, 0.8], [0, 1])
  // Interpolación logarítmica: el reloj baja rápido al principio y se detiene en 15 s
  const seconds = useTransform(progress, (v) => START * Math.pow(END / START, v))
  const clockText = useTransform(seconds, clock)
  const bar = useTransform(seconds, (s) => Math.max(s / START, 0.002))
  const hint = useTransform(scrollYProgress, [0, 0.1], [1, 0])

  const [done, setDone] = useState(false)
  useMotionValueEvent(progress, "change", (v) => setDone(v >= 0.999))

  return (
    <section id="inicio" ref={ref} className="relative h-[230svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <Page className="inicio-pane flex h-full flex-col pb-5 pt-20 sm:pb-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="kicker flex items-center justify-between gap-4 border-b border-foreground pb-3 text-foreground"
          >
            <span>Folio 001</span>
            <span className="hidden sm:inline">Desarrollador de automatizaciones — Cajasan</span>
            <span>Bucaramanga, CO</span>
          </motion.div>

          <div className="relative grid flex-1 grid-cols-12 content-center items-center gap-6 py-6">
            {/* El titular se mide también contra el alto: en pantallas bajas manda el svh */}
            <h1 className="display col-span-12 text-[min(10.2vw,7.2svh)] md:col-span-8 md:text-[min(clamp(2.8rem,6.6vw,8.5rem),9svh)]">
              <MaskLine delay={0.15}>Una semana</MaskLine>
              <MaskLine delay={0.25}>de trabajo manual,</MaskLine>
              <MaskLine delay={0.35}>
                en <em className="text-accent">15 segundos.</em>
              </MaskLine>
            </h1>

            {/* Retrato en móvil */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.6, ease: EASE }}
              className="inicio-retrato col-span-12 flex items-center gap-4 md:hidden"
            >
              <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-secondary">
                <Image src="/perfil.png" alt="" fill sizes="64px" className="duotone object-cover object-[50%_18%]" />
              </div>
              <p className="text-sm leading-snug text-muted-foreground">
                Santiago Romero. Automatizo procesos en Cajasan: {roughCount} herramientas entregadas.
              </p>
            </motion.div>

            <figure className="inicio-foto relative col-span-4 hidden justify-self-end md:block">
              <motion.div
                initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
                animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                transition={{ duration: 1.4, delay: 0.3, ease: EASE }}
                className="inicio-figura relative aspect-[3/4] h-[52svh] overflow-hidden bg-secondary"
              >
                <Image
                  src="/perfil.png"
                  alt="Santiago Romero"
                  fill
                  sizes="(min-width: 768px) 30vw, 1px"
                  className="duotone object-cover object-[50%_18%]"
                  loading="eager"
                  fetchPriority="high"
                />
              </motion.div>
              {/* El sello cae de golpe cuando el reloj llega a 15 s */}
              <motion.div
                initial={false}
                animate={done ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.9 }}
                transition={done ? { type: "spring", stiffness: 520, damping: 22 } : { duration: 0.2 }}
                className="absolute -left-12 bottom-14 -rotate-[9deg]"
              >
                <Stamp size="lg">Procesado</Stamp>
              </motion.div>
              <figcaption className="kicker mt-2 flex justify-between text-[10px]">
                <span>Santiago Romero</span>
                <span>Fig. 1</span>
              </figcaption>
            </figure>
          </div>

          {/* Reloj de compresión */}
          <div className="border-t border-foreground pt-4">
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
              <div>
                <div className="kicker mb-1.5">
                  {done ? "Con la herramienta" : "Tiempo manual · consolidar compras"}
                </div>
                <motion.div
                  className={cn(
                    "tabular font-mono text-[min(13.5vw,9svh)] leading-none tracking-[-0.05em] transition-colors duration-500 md:text-[min(clamp(3rem,6.6vw,6.25rem),10svh)]",
                    done && "text-accent",
                  )}
                >
                  {clockText}
                </motion.div>
              </div>
              <p className="inicio-nota max-w-xs pb-1 text-sm leading-relaxed text-muted-foreground">
                Caso real: consolidar las compras de Abastecimiento tomaba cerca de una semana. Hoy toma entre 5 y 15
                segundos.
              </p>
            </div>
            <div className="mt-4 h-2.5 bg-secondary">
              <motion.div style={{ scaleX: bar }} className="h-full origin-left bg-accent" />
            </div>
            <div className="kicker mt-2 flex justify-between text-[10px]">
              <span>0 h</span>
              <motion.span style={{ opacity: hint }}>↓ Desliza para comprimir</motion.span>
              <span>40 h</span>
            </div>
          </div>
        </Page>
      </div>
    </section>
  )
}
