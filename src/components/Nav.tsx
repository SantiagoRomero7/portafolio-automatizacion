"use client"

import { useEffect, useState } from "react"
import { motion, useScroll } from "framer-motion"
import { emit, EVT, sections, toggleTheme, useModKey, useTheme } from "@/lib/site"
import { cn } from "@/lib/utils"

export function Nav() {
  const [active, setActive] = useState<string>("inicio")
  const theme = useTheme()
  const mod = useModKey()
  const { scrollYProgress } = useScroll()

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: "-45% 0px -54% 0px" },
    )
    for (const s of sections) {
      const el = document.getElementById(s.id)
      if (el) obs.observe(el)
    }
    return () => obs.disconnect()
  }, [])

  const current = sections.find((s) => s.id === active) ?? sections[0]
  const last = sections[sections.length - 1]

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[88rem] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
          <a href="#inicio" className="flex items-center gap-2.5">
            <span className="grid h-6 w-6 place-items-center bg-accent font-display text-sm italic text-accent-foreground">
              S
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
              <span className="sm:hidden">S. Romero</span>
              <span className="hidden sm:inline">Santiago Romero</span>
            </span>
          </a>

          <nav aria-label="Secciones" className="hidden items-center gap-5 xl:flex">
            {sections.slice(1).map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                aria-current={active === s.id ? "true" : undefined}
                className={cn(
                  "font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
                  active === s.id ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className={cn("mr-1.5", active === s.id && "text-accent")}>{s.n}</span>
                {s.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => emit(EVT.openIndex)}
              className="flex h-8 items-center gap-2 border border-border px-2.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors hover:border-foreground"
            >
              Índice <kbd className="hidden font-mono text-muted-foreground sm:inline">{mod} K</kbd>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "tinta" ? "Cambiar a modo papel" : "Cambiar a modo tinta"}
              className="flex h-8 items-center gap-2 border border-border px-2.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors hover:border-foreground"
            >
              <span className="h-2.5 w-2.5 rounded-full border border-foreground bg-foreground [.dark_&]:bg-transparent" />
              {theme === "tinta" ? "Papel" : "Tinta"}
            </button>
          </div>
        </div>
        <motion.div style={{ scaleX: scrollYProgress }} className="absolute inset-x-0 -bottom-px h-px origin-left bg-accent" />
      </header>

      <div
        aria-hidden
        className="pointer-events-none fixed bottom-8 left-3 z-40 hidden rotate-180 font-mono text-[10px] uppercase tracking-[0.18em] text-[#e8e0cb] mix-blend-difference [writing-mode:vertical-rl] lg:block"
      >
        Folio {current.n} / {last.n} — {current.label}
      </div>
    </>
  )
}
