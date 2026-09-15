export const nf = new Intl.NumberFormat("es-CO")

/** 7552 → "125 h 52 min", 0.25 → "15 s" */
export function fmtDur(min: number): string {
  if (min <= 0) return "0 min"
  if (min < 1) return `${Math.round(min * 60)} s`
  if (min < 60) return `${Math.round(min)} min`
  let h = Math.floor(min / 60)
  let m = Math.round(min - h * 60)
  if (m === 60) {
    h += 1
    m = 0
  }
  return m ? `${nf.format(h)} h ${String(m).padStart(2, "0")} min` : `${nf.format(h)} h`
}

/** Segundos → "40:00:00" */
export function clock(sec: number): string {
  const t = Math.max(0, Math.round(sec))
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  return [h, m, t % 60].map((v) => String(v).padStart(2, "0")).join(":")
}

export function normalize(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
}

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}
