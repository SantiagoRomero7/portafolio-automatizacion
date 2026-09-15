"use client"

import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { automations } from "@/data/automations"
import { contact } from "@/data/contact"
import { emit, EVT, sections, toggleTheme } from "@/lib/site"
import { normalize, scrollToId } from "@/lib/format"
import { EASE } from "@/components/ui"
import { cn } from "@/lib/utils"

type Item = { key: string; group: string; label: string; hint?: string; run: () => void }

const openTab = (url: string) => window.open(url, "_blank", "noopener,noreferrer")

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [sel, setSel] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const show = () => {
      setQuery("")
      setSel(0)
      setOpen(true)
    }
    const onKey = (e: KeyboardEvent) => {
      if (open && e.key === "Escape") {
        setOpen(false)
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        if (open) setOpen(false)
        else show()
      }
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener(EVT.openIndex, show)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener(EVT.openIndex, show)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const items = useMemo<Item[]>(
    () => [
      ...sections.map((s) => ({
        key: `s-${s.id}`,
        group: "Secciones",
        label: s.label,
        hint: s.n,
        run: () => scrollToId(s.id),
      })),
      ...automations.map((a) => ({
        key: `a-${a.id}`,
        group: "Herramientas",
        label: a.name,
        hint: `${a.before} → ${a.after}`,
        run: () => emit(EVT.openRow, a.id),
      })),
      {
        key: "copiar",
        group: "Acciones",
        label: "Copiar mi correo",
        hint: contact.email,
        run: () => void navigator.clipboard?.writeText(contact.email).catch(() => {}),
      },
      { key: "whatsapp", group: "Acciones", label: "Escribir por WhatsApp", hint: contact.phone, run: () => openTab(contact.whatsapp) },
      { key: "linkedin", group: "Acciones", label: "Abrir LinkedIn", run: () => openTab(contact.linkedin) },
      { key: "github", group: "Acciones", label: "Abrir GitHub", run: () => openTab(contact.github) },
      { key: "tema", group: "Acciones", label: "Cambiar entre papel y tinta", run: toggleTheme },
    ],
    [],
  )

  const q = normalize(query.trim())
  const filtered = q ? items.filter((i) => normalize(`${i.label} ${i.hint ?? ""} ${i.group}`).includes(q)) : items
  const index = Math.min(sel, Math.max(filtered.length - 1, 0))

  useEffect(() => {
    listRef.current?.querySelector(`[data-i="${index}"]`)?.scrollIntoView({ block: "nearest" })
  }, [index])

  const choose = (item?: Item) => {
    if (!item) return
    setOpen(false)
    window.setTimeout(item.run, 60)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSel((index + 1) % Math.max(filtered.length, 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSel((index - 1 + filtered.length) % Math.max(filtered.length, 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      choose(filtered[index])
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]"
        >
          <div className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Índice del portafolio"
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="relative w-full max-w-xl border border-foreground bg-background shadow-[8px_8px_0_0_var(--foreground)]"
          >
            <div className="flex items-center gap-3 border-b border-foreground px-4">
              <span className="font-mono text-sm text-accent">›</span>
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSel(0)
                }}
                onKeyDown={onKeyDown}
                placeholder="Busca una sección, herramienta o acción…"
                aria-label="Buscar"
                className="h-14 min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
              />
              <kbd className="font-mono text-[10px] text-muted-foreground">ESC</kbd>
            </div>
            <ul ref={listRef} role="listbox" className="max-h-[52vh] overflow-y-auto py-2">
              {filtered.length === 0 && (
                <li className="px-4 py-6 text-sm text-muted-foreground">Nada con “{query}”.</li>
              )}
              {filtered.map((item, i) => (
                <Fragment key={item.key}>
                  {(i === 0 || filtered[i - 1].group !== item.group) && (
                    <li role="presentation" className="kicker px-4 pb-1 pt-3 text-[10px]">
                      {item.group}
                    </li>
                  )}
                  <li
                    role="option"
                    aria-selected={i === index}
                    data-i={i}
                    onMouseMove={() => i !== index && setSel(i)}
                    onClick={() => choose(item)}
                    className={cn(
                      "mx-2 flex cursor-pointer items-baseline gap-3 px-3 py-2",
                      i === index && "bg-foreground text-background",
                    )}
                  >
                    <span className="truncate">{item.label}</span>
                    {item.hint && (
                      <span
                        className={cn(
                          "ml-auto hidden shrink-0 font-mono text-[11px] sm:inline",
                          i === index ? "text-background/70" : "text-muted-foreground",
                        )}
                      >
                        {item.hint}
                      </span>
                    )}
                  </li>
                </Fragment>
              ))}
            </ul>
            <div className="flex justify-between border-t border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <span>↑↓ navegar · ↵ abrir</span>
              <span>{automations.length} herramientas</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
