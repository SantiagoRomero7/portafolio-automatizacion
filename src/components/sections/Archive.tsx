"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowDown, ArrowRight, Search, X } from "lucide-react"
import {
  areaColor,
  areas,
  automations,
  factor,
  sumAfter,
  sumBefore,
  tipoLabel,
  trace,
  workshop,
  type Area,
  type Automation,
  type Tipo,
} from "@/data/automations"
import { cases } from "@/data/cases"
import { fmtDur, nf, normalize } from "@/lib/format"
import { EVT, type StackFilter } from "@/lib/site"
import { EASE, MaskLine, Page, Reveal, Stamp } from "@/components/ui"
import { cn } from "@/lib/utils"

type Sort = "n" | "horas" | "factor"

const SORTS: { key: Sort; label: string }[] = [
  { key: "n", label: "N.º" },
  { key: "horas", label: "Más horas" },
  { key: "factor", label: "Más rápido" },
]

// En tablet las columnas fijas no dejan sitio al nombre: allí va una rejilla estrecha y sin "Estado"
const COLS =
  "md:grid-cols-[2.5rem_minmax(0,1fr)_6.5rem_7rem_4.5rem] lg:grid-cols-[3rem_minmax(0,1fr)_9rem_9.5rem_6.5rem_7.5rem]"
const caseIds = new Set(cases.map((c) => c.id))
const areaCount = Object.fromEntries(areas.map((ar) => [ar, automations.filter((a) => a.area === ar).length]))
const tipoCount = Object.fromEntries(trace.tipos.map((t) => [t, automations.filter((a) => a.tipo === t).length]))

function usesStack(a: Automation, f: StackFilter) {
  return a.stack.some((s) => f.keys.some((k) => normalize(s).includes(k)))
}

function fmtFactor(a: Automation) {
  const f = factor(a)
  return f ? `×${nf.format(Math.round(f))}` : "sin atención"
}

export function Archive() {
  const [area, setArea] = useState<Area | null>(null)
  const [tipo, setTipo] = useState<Tipo | null>(null)
  const [stack, setStack] = useState<StackFilter | null>(null)
  const [sort, setSort] = useState<Sort>("n")
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState<string | null>(null)

  // Otras secciones (índice, método) pueden abrir una fila o filtrar por herramienta
  useEffect(() => {
    const onRow = (e: Event) => {
      const id = (e as CustomEvent<string>).detail
      setArea(null)
      setTipo(null)
      setStack(null)
      setQuery("")
      setOpen(id)
      window.setTimeout(
        () => document.getElementById(`fila-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }),
        80,
      )
    }
    const onStack = (e: Event) => {
      setStack((e as CustomEvent<StackFilter>).detail)
      setArea(null)
      setTipo(null)
      setQuery("")
      setOpen(null)
      document.getElementById("archivo-tabla")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    const onTipo = (e: Event) => {
      setTipo((e as CustomEvent<Tipo>).detail)
      setArea(null)
      setStack(null)
      setQuery("")
      setOpen(null)
      document.getElementById("archivo-tabla")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    window.addEventListener(EVT.openRow, onRow)
    window.addEventListener(EVT.filterStack, onStack)
    window.addEventListener(EVT.filterTipo, onTipo)
    return () => {
      window.removeEventListener(EVT.openRow, onRow)
      window.removeEventListener(EVT.filterStack, onStack)
      window.removeEventListener(EVT.filterTipo, onTipo)
    }
  }, [])

  const rows = useMemo(() => {
    const q = normalize(query.trim())
    const list = automations.filter(
      (a) =>
        (!area || a.area === area) &&
        (!tipo || a.tipo === tipo) &&
        (!stack || usesStack(a, stack)) &&
        (!q || normalize(`${a.name} ${a.what} ${a.area} ${a.stack.join(" ")}`).includes(q)),
    )
    if (sort === "horas") list.sort((x, y) => y.beforeMin - y.afterMin - (x.beforeMin - x.afterMin))
    if (sort === "factor") list.sort((x, y) => (factor(y) ?? -1) - (factor(x) ?? -1))
    return list
  }, [area, tipo, stack, sort, query])

  const clearFilters = () => {
    setArea(null)
    setTipo(null)
    setStack(null)
    setQuery("")
  }

  return (
    <section id="archivo" className="relative py-28 md:py-40">
      <Page>
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <h2 className="display text-[clamp(4rem,12vw,12rem)] leading-[0.84] lg:col-span-7">
            <MaskLine inView>El</MaskLine>
            <MaskLine inView delay={0.08}>
              <em>Archivo</em>
            </MaskLine>
          </h2>
          <Reveal className="space-y-4 lg:col-span-5 lg:pb-5">
            <div className="kicker">02 — Registro de entregas</div>
            <p className="text-lg leading-relaxed">
              Cada fila es un proceso que alguien hacía a mano. Lo tachado en rojo es lo que tomaba antes; al lado, lo
              que toma hoy.
            </p>
            <p className="text-sm text-muted-foreground">
              {areas.length} unidades de negocio, y la lista sigue creciendo. Cada fila dice además cómo arranca la
              herramienta y si deja registro de cada corrida.
            </p>
          </Reveal>
        </div>

        {/* El bloque pegajoso vive aquí dentro: así deja de flotar al llegar al taller */}
        <div className="relative">
          {/* Controles */}
          <div
            id="archivo-tabla"
            className="z-20 mt-16 scroll-mt-16 border-b border-foreground bg-background py-3 md:sticky md:top-14"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
                <Chip active={!area && !tipo && !stack} onClick={clearFilters}>
                  Todas <Count>{automations.length}</Count>
                </Chip>
                {areas.map((ar) => (
                  <Chip key={ar} active={area === ar} onClick={() => setArea(area === ar ? null : ar)}>
                    <span className="h-2 w-2 shrink-0" style={{ background: areaColor[ar] }} />
                    {ar} <Count>{areaCount[ar]}</Count>
                  </Chip>
                ))}
                <span className="mx-1 h-9 w-px shrink-0 bg-border" aria-hidden />
                {trace.tipos.map((t) => (
                  <Chip
                    key={t}
                    active={tipo === t}
                    onClick={() => setTipo(tipo === t ? null : t)}
                    title={`Arranque: ${tipoLabel[t]}`}
                  >
                    .{t} <Count>{tipoCount[t]}</Count>
                  </Chip>
                ))}
                {stack && (
                  <Chip active onClick={() => setStack(null)}>
                    Usa {stack.label} <X className="h-3 w-3" />
                  </Chip>
                )}
              </div>
              <div className="flex items-center gap-2 lg:ml-auto">
                <label className="flex h-9 flex-1 items-center gap-2 border border-border px-2.5 focus-within:border-foreground lg:w-44 lg:flex-none">
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="sr-only">Buscar en el archivo</span>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar…"
                    className="w-full bg-transparent font-mono text-xs outline-none placeholder:text-muted-foreground"
                  />
                </label>
                <div className="flex h-9 border border-border" role="group" aria-label="Ordenar">
                  {SORTS.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setSort(s.key)}
                      aria-pressed={sort === s.key}
                      className={cn(
                        "whitespace-nowrap px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors",
                        sort === s.key ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Encabezado de columnas */}
          <div className={cn("kicker hidden gap-x-4 border-b border-border py-3 text-[10px] md:grid", COLS)}>
            <span>N.º</span>
            <span>Herramienta</span>
            <span>Antes</span>
            <span>Después</span>
            <span>Más rápido</span>
            <span className="max-lg:hidden">Estado</span>
          </div>

          <ul>
            {rows.map((a) => (
              <Row key={a.id} a={a} open={open === a.id} onToggle={() => setOpen(open === a.id ? null : a.id)} />
            ))}
          </ul>

          {rows.length === 0 ? (
            <div className="border-b border-border py-12 text-center text-muted-foreground">
              Nada por aquí.{" "}
              <button type="button" onClick={clearFilters} className="link-ink text-foreground">
                Quitar filtros
              </button>
            </div>
          ) : (
            <div className={cn("grid grid-cols-[2.25rem_1fr] gap-x-4 border-b-4 border-double border-foreground py-5 md:items-baseline", COLS)}>
              <span />
              <span className="kicker text-foreground">
                Total · {rows.length} {rows.length === 1 ? "herramienta" : "herramientas"}
              </span>
              <span className="col-start-2 font-mono text-sm text-muted-foreground line-through decoration-accent md:col-start-auto">
                {fmtDur(sumBefore(rows))}
              </span>
              <span className="col-start-2 font-mono text-sm font-semibold md:col-start-auto">{fmtDur(sumAfter(rows))}</span>
            </div>
          )}
        </div>

        {/* En construcción */}
        <Reveal className="mt-20 grid gap-8 md:grid-cols-12">
          <div className="md:col-span-3">
            <div className="kicker">En el taller</div>
            <p className="mt-2 text-sm text-muted-foreground">Sin cifras hasta entregarlos.</p>
          </div>
          <ul className="grid gap-8 sm:grid-cols-3 md:col-span-9">
            {workshop.map((w) => (
              <li key={w.name} className="border-l border-accent pl-4">
                <Stamp tone="muted" className="mb-4">
                  En construcción
                </Stamp>
                <div className="font-display text-xl leading-tight">{w.name}</div>
                <div className="mt-1.5 text-sm text-muted-foreground">{w.detail}</div>
              </li>
            ))}
          </ul>
        </Reveal>
      </Page>
    </section>
  )
}

function Row({ a, open, onToggle }: { a: Automation; open: boolean; onToggle: () => void }) {
  return (
    <li id={`fila-${a.id}`} className="group relative scroll-mt-40 border-b border-border">
      <span
        className={cn(
          "absolute -left-3 top-0 h-full w-[3px] origin-top bg-accent transition-transform duration-300",
          open ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100",
        )}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn("grid w-full grid-cols-[2.25rem_1fr_auto] items-center gap-x-4 gap-y-1 py-4 text-left md:py-5", COLS)}
      >
        <span className="tabular font-mono text-xs text-muted-foreground">{String(a.n).padStart(2, "0")}</span>
        <span className="min-w-0">
          <span className="block font-display text-xl leading-tight transition-colors group-hover:text-accent md:text-2xl">
            {a.name}
          </span>
          <span className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <span className="h-2 w-2 shrink-0" style={{ background: areaColor[a.area] }} />
            {a.area}
            {a.tipo && <span className="opacity-60 max-sm:hidden">· .{a.tipo}</span>}
          </span>
        </span>
        <span className="font-mono text-sm text-muted-foreground line-through decoration-accent decoration-2 max-md:hidden">
          {a.before}
        </span>
        <span className="font-mono text-sm font-semibold max-md:hidden">{a.after}</span>
        <span className="tabular font-mono text-sm max-md:hidden">{fmtFactor(a)}</span>
        <span className="max-lg:hidden">
          {a.status === "Entregado" ? <Stamp tone="positive">Entregado</Stamp> : <Stamp>En mejora</Stamp>}
        </span>
        <ArrowDown
          className={cn("h-4 w-4 text-muted-foreground transition-transform md:hidden", open && "rotate-180")}
        />
        {/* Línea compacta en móvil */}
        <span className="col-span-2 col-start-2 font-mono text-xs md:hidden">
          <s className="text-muted-foreground decoration-accent">{a.before}</s> → <strong>{a.after}</strong>
          <span className="text-muted-foreground"> · {fmtFactor(a)}</span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="overflow-hidden"
          >
            <Detail a={a} />
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

function Detail({ a }: { a: Automation }) {
  return (
    <div className="grid gap-8 pb-10 pt-2 md:grid-cols-12 md:pl-16">
      <div className="space-y-5 md:col-span-5">
        <p className="leading-relaxed">{a.what}</p>
        <div className="flex flex-wrap gap-1.5">
          {a.stack.map((s) => (
            <span key={s} className="border border-border px-2 py-1 font-mono text-[11px]">
              {s}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {a.tipo && (
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              .{a.tipo} · {tipoLabel[a.tipo]}
            </span>
          )}
          {a.audited && <Stamp tone="positive">Auditada</Stamp>}
        </div>
        {a.status === "En mejora" && (
          <p className="text-sm text-muted-foreground">Ya funciona y corre en producción; sigo afinando mejoras.</p>
        )}
        {caseIds.has(a.id) && (
          <a
            href={`#caso-${a.id}`}
            className="link-ink inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-accent"
          >
            Leer el caso completo <ArrowRight className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
      <div className="md:col-span-7">
        <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1.15fr_auto_1fr]">
          <div className="space-y-2">
            <div className="kicker text-[10px]">Entra</div>
            {a.inputs.map((i) => (
              <div key={i} className="border border-dashed border-muted-foreground/60 bg-card px-3 py-2 text-[13px] leading-snug">
                {i}
              </div>
            ))}
          </div>
          <Connector />
          <div className="bg-panel p-4 text-panel-foreground">
            <div className="kicker text-[10px] text-panel-muted">Proceso</div>
            <div className="mt-1 font-display text-lg leading-tight">{a.name}</div>
            <div className="mt-3 font-mono text-[11px]">
              <s className="text-panel-muted">{a.before}</s> → {a.after}
            </div>
          </div>
          <Connector />
          <div className="space-y-2">
            <div className="kicker text-[10px]">Sale</div>
            {a.outputs.map((o) => (
              <div key={o} className="border border-foreground bg-card px-3 py-2 text-[13px] leading-snug">
                {o}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Connector() {
  return (
    <div className="flex justify-center text-muted-foreground" aria-hidden>
      <ArrowRight className="hidden h-4 w-4 sm:block" />
      <ArrowDown className="h-4 w-4 sm:hidden" />
    </div>
  )
}

function Chip({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean
  onClick: () => void
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={cn(
        "flex h-9 shrink-0 items-center gap-2 border px-3 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors",
        active ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground",
      )}
    >
      {children}
    </button>
  )
}

function Count({ children }: { children: React.ReactNode }) {
  return <span className="tabular opacity-60">{children}</span>
}
