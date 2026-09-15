"use client"

import { useSyncExternalStore } from "react"

export const sections = [
  { id: "inicio", n: "00", label: "Inicio" },
  { id: "semana", n: "01", label: "La cuenta" },
  { id: "archivo", n: "02", label: "Archivo" },
  { id: "casos", n: "03", label: "Casos" },
  { id: "demo", n: "04", label: "Demo" },
  { id: "metodo", n: "05", label: "Método" },
  { id: "sobre-mi", n: "06", label: "Sobre mí" },
  { id: "contacto", n: "07", label: "Contacto" },
] as const

/* ---------- Eventos entre secciones ---------- */

export const EVT = {
  openIndex: "indice:abrir",
  openRow: "archivo:abrir",
  filterStack: "archivo:stack",
  theme: "tema",
} as const

export type StackFilter = { label: string; keys: string[] }

export function emit<T>(name: string, detail?: T) {
  window.dispatchEvent(new CustomEvent(name, { detail }))
}

/* ---------- Tema: papel / tinta ---------- */

export type Theme = "papel" | "tinta"

function readTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "tinta" : "papel"
}

function subscribeTheme(cb: () => void) {
  window.addEventListener(EVT.theme, cb)
  return () => window.removeEventListener(EVT.theme, cb)
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribeTheme, readTheme, () => "papel")
}

export function toggleTheme() {
  const next: Theme = readTheme() === "tinta" ? "papel" : "tinta"
  document.documentElement.classList.toggle("dark", next === "tinta")
  try {
    localStorage.setItem("tema", next)
  } catch {}
  emit(EVT.theme, next)
}

/* ---------- Tecla modificadora (⌘ en Mac, Ctrl en el resto) ---------- */

const noop = () => () => {}

export function useModKey(): string {
  return useSyncExternalStore(
    noop,
    () => (/Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl"),
    () => "Ctrl",
  )
}
