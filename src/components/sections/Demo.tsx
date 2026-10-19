"use client"

import { Fragment, useDeferredValue, useMemo, useRef, useState } from "react"
import { Eraser, Shuffle, Upload } from "lucide-react"
import { nf } from "@/lib/format"
import { MaskLine, Page, Reveal, Stamp } from "@/components/ui"
import { cn } from "@/lib/utils"

/*
 * Lógica del Control de Consecutivos (herramienta n.º 8), portada a JavaScript:
 * agrupa por tipo + prefijo, ordena los folios y detecta saltos en la numeración.
 */

type Group = {
  key: string
  tipo: string
  prefijo: string
  inicial: number
  final: number
  cantidad: number
  faltantes: number
  duplicados: number
  rangos: string[]
}

const TIPOS: Record<string, string> = {
  FE: "Factura electrónica",
  NC: "Nota crédito",
  ND: "Nota débito",
  DS: "Documento soporte",
}

function analyze(text: string) {
  const t0 = performance.now()
  const map = new Map<string, { tipo: string; prefijo: string; folios: number[] }>()
  let total = 0
  let invalid = 0

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) continue
    const tokens = line.replace(/[-_/](?=\d+$)/, " ").split(/[\s,;|\t]+/).filter(Boolean)
    const last = tokens[tokens.length - 1]
    if (!/^\d{1,12}$/.test(last)) {
      invalid++
      continue
    }
    const rest = tokens.slice(0, -1).map((t) => t.toUpperCase())
    const tipo = rest.length >= 2 ? rest[0] : "—"
    const prefijo = rest.length >= 2 ? rest.slice(1).join(" ") : (rest[0] ?? "SIN PREFIJO")
    const key = `${tipo}|${prefijo}`
    let g = map.get(key)
    if (!g) map.set(key, (g = { tipo, prefijo, folios: [] }))
    g.folios.push(Number(last))
    total++
  }

  const groups: Group[] = []
  for (const [key, g] of map) {
    const sorted = Float64Array.from(g.folios).sort()
    let cantidad = 0
    let duplicados = 0
    let faltantes = 0
    const rangos: string[] = []
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] === sorted[i - 1]) {
        duplicados++
        continue
      }
      cantidad++
      if (i > 0) {
        const gap = sorted[i] - sorted[i - 1] - 1
        if (gap > 0) {
          faltantes += gap
          rangos.push(gap === 1 ? `${sorted[i - 1] + 1}` : `${sorted[i - 1] + 1}–${sorted[i] - 1}`)
        }
      }
    }
    groups.push({
      key,
      tipo: g.tipo,
      prefijo: g.prefijo,
      inicial: sorted[0],
      final: sorted[sorted.length - 1],
      cantidad,
      faltantes,
      duplicados,
      rangos,
    })
  }
  groups.sort((a, b) => a.tipo.localeCompare(b.tipo) || a.prefijo.localeCompare(b.prefijo))

  return { groups, total, invalid, ms: performance.now() - t0 }
}

// Generador determinista para que el lote inicial sea igual en servidor y cliente
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function sampleBatch(seed: number): string {
  const rand = mulberry32(seed)
  const series: [string, string, number, number][] = [
    ["FE", "FVE", 100200, 420],
    ["FE", "FVT", 45010, 180],
    ["NC", "NCE", 3120, 70],
    ["DS", "DSE", 880, 50],
  ]
  const lines: string[] = []
  for (const [tipo, prefijo, start, n] of series) {
    for (let i = 0; i < n; i++) {
      const r = rand()
      if (r < 0.01) {
        i += 1 + Math.floor(rand() * 4) // un bloque de folios perdidos
        continue
      }
      if (r < 0.028) continue // un folio suelto perdido
      lines.push(`${tipo} ${prefijo} ${start + i}`)
      if (r > 0.997) lines.push(`${tipo} ${prefijo} ${start + i}`) // algún duplicado
    }
  }
  for (let j = lines.length - 1; j > 0; j--) {
    const x = Math.floor(rand() * (j + 1))
    ;[lines[j], lines[x]] = [lines[x], lines[j]]
  }
  return lines.join("\n")
}

export function Demo() {
  const [text, setText] = useState(() => sampleBatch(2026))
  const deferred = useDeferredValue(text)
  const result = useMemo(() => analyze(deferred), [deferred])
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const missing = result.groups.reduce((acc, g) => acc + g.faltantes, 0)
  const dups = result.groups.reduce((acc, g) => acc + g.duplicados, 0)

  async function loadFile(file?: File) {
    if (!file || file.size > 5_000_000) return
    setText(await file.text())
    setOpenKey(null)
  }

  return (
    <section id="demo" className="relative border-t border-foreground py-28 md:py-40">
      <Page>
        <div className="grid items-end gap-8 lg:grid-cols-12">
          {/* La línea más larga tiene que caber en su máscara: una máscara, un renglón */}
          <h2 className="display text-[clamp(2.4rem,5.9vw,5.75rem)] lg:col-span-8">
            <MaskLine inView>No es una animación.</MaskLine>
            <MaskLine inView delay={0.08}>
              <em className="text-accent">Es el algoritmo.</em>
            </MaskLine>
          </h2>
          <Reveal className="space-y-3 lg:col-span-4 lg:pb-3">
            <div className="kicker">04 — Demo en vivo</div>
            <p className="leading-relaxed">
              La lógica del Control de Consecutivos, escrita de nuevo en JavaScript. Pega tus folios (tipo, prefijo y
              número, uno por línea) o genera un lote de prueba.
            </p>
            <p className="text-sm text-muted-foreground">Todo corre en tu navegador. Nada se envía a ningún lado.</p>
          </Reveal>
        </div>

        <Reveal className="mt-14 grid gap-px border border-foreground bg-foreground lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          {/* Entrada */}
          <div className="flex min-w-0 flex-col bg-background">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
              <span className="kicker text-[10px]">Entrada · {nf.format(result.total)} folios</span>
              <div className="flex gap-1.5">
                <ToolButton onClick={() => { setText(sampleBatch(Date.now())); setOpenKey(null) }} label="Lote nuevo">
                  <Shuffle />
                </ToolButton>
                <ToolButton onClick={() => fileRef.current?.click()} label="Cargar archivo">
                  <Upload />
                </ToolButton>
                <ToolButton onClick={() => setText("")} label="Limpiar">
                  <Eraser />
                </ToolButton>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".txt,.csv"
                  className="hidden"
                  onChange={(e) => loadFile(e.target.files?.[0])}
                />
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                loadFile(e.dataTransfer.files?.[0])
              }}
              spellCheck={false}
              aria-label="Folios, uno por línea"
              placeholder={"FE FVE 100200\nFE FVE 100201\nNC NCE 3120\n…\n\nO arrastra aquí un .txt o .csv"}
              className={cn(
                "lined h-[340px] w-full resize-none bg-transparent px-4 pt-[3px] font-mono text-[12px] leading-[24px] outline-none md:h-[460px]",
                dragging && "bg-secondary",
              )}
            />
          </div>

          {/* Resultado */}
          <div className="flex min-w-0 flex-col bg-background">
            <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
              <span className="kicker text-[10px]">Resultado · {result.groups.length} series</span>
              {result.total > 0 &&
                (missing > 0 ? (
                  <Stamp>{nf.format(missing)} faltantes</Stamp>
                ) : (
                  <Stamp tone="positive">Sin saltos</Stamp>
                ))}
            </div>
            <div className="min-h-[260px] flex-1 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="kicker text-[10px]">
                  <tr className="border-b border-border">
                    <th className="px-4 py-2.5 font-normal">Tipo</th>
                    <th className="px-2 py-2.5 font-normal">Prefijo</th>
                    <th className="px-2 py-2.5 text-right font-normal">Inicial</th>
                    <th className="px-2 py-2.5 text-right font-normal">Final</th>
                    <th className="px-2 py-2.5 text-right font-normal">Cant.</th>
                    <th className="px-4 py-2.5 text-right font-normal">Faltantes</th>
                  </tr>
                </thead>
                <tbody className="tabular font-mono text-[13px]">
                  {result.groups.map((g) => {
                    const expanded = openKey === g.key
                    return (
                      <Fragment key={g.key}>
                        <tr
                          onClick={() => g.faltantes > 0 && setOpenKey(expanded ? null : g.key)}
                          className={cn(
                            "border-b border-border",
                            g.faltantes > 0 && "cursor-pointer hover:bg-secondary/70",
                          )}
                        >
                          <td className="px-4 py-3" title={TIPOS[g.tipo]}>
                            {g.tipo}
                          </td>
                          <td className="px-2 py-3">{g.prefijo}</td>
                          <td className="px-2 py-3 text-right">{g.inicial}</td>
                          <td className="px-2 py-3 text-right">{g.final}</td>
                          <td className="px-2 py-3 text-right">{nf.format(g.cantidad)}</td>
                          <td className={cn("px-4 py-3 text-right", g.faltantes > 0 ? "text-accent" : "text-positive")}>
                            {g.faltantes > 0 ? `${nf.format(g.faltantes)} ${expanded ? "▴" : "▾"}` : "0"}
                          </td>
                        </tr>
                        {expanded && (
                          <tr className="border-b border-border bg-secondary/50">
                            <td colSpan={6} className="px-4 py-3">
                              <div className="flex flex-wrap gap-1.5">
                                {g.rangos.slice(0, 40).map((r) => (
                                  <span key={r} className="border border-accent/50 px-1.5 py-0.5 text-[11px] text-accent">
                                    {r}
                                  </span>
                                ))}
                                {g.rangos.length > 40 && (
                                  <span className="px-1.5 py-0.5 text-[11px] text-muted-foreground">
                                    y {g.rangos.length - 40} rangos más
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
              {result.total === 0 && (
                <p className="px-4 py-10 text-sm text-muted-foreground">Sin folios todavía. Pega una lista o genera un lote.</p>
              )}
            </div>
            <div className="grid gap-px border-t border-border bg-border sm:grid-cols-2">
              <div className="bg-background px-4 py-3">
                <div className="kicker text-[10px]">A mano</div>
                <div className="mt-1 font-mono text-sm">~4 h, prefijo por prefijo</div>
              </div>
              <div className="bg-background px-4 py-3">
                <div className="kicker text-[10px]">Aquí</div>
                <div className="mt-1 font-mono text-sm text-accent" suppressHydrationWarning>
                  {result.ms < 1 ? "menos de 1 ms" : `${result.ms.toFixed(1).replace(".", ",")} ms`}
                  {dups > 0 && <span className="text-muted-foreground"> · {dups} duplicados</span>}
                  {result.invalid > 0 && <span className="text-muted-foreground"> · {result.invalid} líneas ignoradas</span>}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Page>
    </section>
  )
}

function ToolButton({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="flex h-8 items-center gap-1.5 border border-border px-2 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors hover:border-foreground [&_svg]:h-3.5 [&_svg]:w-3.5"
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
