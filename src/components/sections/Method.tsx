"use client"

import { automations } from "@/data/automations"
import { normalize } from "@/lib/format"
import { emit, EVT, type StackFilter } from "@/lib/site"
import { MaskLine, Page, Reveal } from "@/components/ui"

type Tool = { label: string; keys?: string[]; note?: string }

const stages: { n: string; title: string; line: string; tools: Tool[] }[] = [
  {
    n: "01",
    title: "Entender",
    line: "Me siento con quien hace el proceso y lo repito a mano una vez, con sus archivos reales. Ahí aparecen las reglas que nadie había escrito.",
    tools: [
      { label: "Excel", keys: ["openpyxl", "win32com", "pandas"] },
      { label: "pandas", keys: ["pandas"] },
      { label: "SQL" },
      { label: "Power BI", note: "en el taller" },
    ],
  },
  {
    n: "02",
    title: "Transformar",
    line: "Convierto esas reglas en código que valida, cruza y corrige. Si una vía falla, el programa tiene otra.",
    tools: [
      { label: "Python", keys: ["python"] },
      { label: "openpyxl", keys: ["openpyxl"] },
      { label: "Excel por COM", keys: ["win32com"] },
      { label: "OCR", keys: ["tesseract", "easyocr"] },
      { label: "Lectura de PDF", keys: ["pymupdf", "pypdf2"] },
      { label: "XML / ZIP", keys: ["xml", "zipfile"] },
      { label: "Go" },
    ],
  },
  {
    n: "03",
    title: "Orquestar",
    line: "Cuando el proceso vive en otro sistema, un robot o un flujo lo opera: descarga, carga y deja el archivo listo.",
    tools: [
      { label: "Power Automate", keys: ["power automate"] },
      { label: "Pix RPA", keys: ["pix"] },
      { label: "Selenium" },
      { label: "n8n" },
      { label: "Zapier" },
    ],
  },
  {
    n: "04",
    title: "Entregar",
    line: "Una ventana clara y un ejecutable que se abre con doble clic. Si el área no lo adopta, no sirvió.",
    tools: [
      { label: "Tkinter", keys: ["tkinter"] },
      { label: "PySide6", keys: ["pyside"] },
      { label: "PyInstaller (.exe)", keys: ["pyinstaller"] },
      { label: "React / Next.js", note: "este sitio" },
      { label: "TypeScript", note: "este sitio" },
      { label: "Tailwind CSS", note: "este sitio" },
    ],
  },
]

const also = ["Node.js", "Express", "APIs REST", "PostgreSQL", "MySQL", "MongoDB", "Supabase", "Vue", "OpenAI", "Git"]

function countFor(keys?: string[]) {
  if (!keys) return 0
  return automations.filter((a) => a.stack.some((s) => keys.some((k) => normalize(s).includes(k)))).length
}

export function Method() {
  return (
    <section id="metodo" className="relative border-t border-foreground py-28 md:py-40">
      <Page>
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <h2 className="display text-[clamp(3rem,8vw,8rem)] lg:col-span-8">
            <MaskLine inView>De la queja</MaskLine>
            <MaskLine inView delay={0.08}>
              <em>al ejecutable.</em>
            </MaskLine>
          </h2>
          <Reveal className="space-y-3 lg:col-span-4 lg:pb-3">
            <div className="kicker">05 — Método</div>
            <p className="leading-relaxed text-muted-foreground">
              Cuatro pasos, siempre en el mismo orden. La cifra al lado de cada herramienta es en cuántas entregas
              aparece; tócala para filtrar el archivo.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid border-t border-foreground sm:grid-cols-2 lg:grid-cols-4">
          {stages.map((st, i) => (
            <Reveal
              key={st.n}
              delay={i * 0.06}
              className="border-b border-border py-8 sm:px-6 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:first:pl-0 lg:last:border-r-0"
            >
              <div className="font-mono text-xs text-accent">{st.n}</div>
              <h3 className="display mt-3 text-5xl">{st.title}</h3>
              <p className="mt-4 min-h-[6.5rem] text-sm leading-relaxed text-muted-foreground">{st.line}</p>
              <ul className="mt-6 space-y-0.5">
                {st.tools.map((t) => {
                  const count = countFor(t.keys)
                  const filter: StackFilter | null = count && t.keys ? { label: t.label, keys: t.keys } : null
                  const content = (
                    <>
                      <span className="transition-colors group-hover:text-accent">{t.label}</span>
                      <span className="leader" />
                      <span className="tabular font-mono text-xs text-muted-foreground">
                        {count ? `×${count}` : (t.note ?? "·")}
                      </span>
                    </>
                  )
                  return (
                    <li key={t.label}>
                      {filter ? (
                        <button
                          type="button"
                          onClick={() => emit(EVT.filterStack, filter)}
                          className="group flex w-full items-baseline gap-2 py-1.5 text-left text-[15px]"
                          title={`Ver las ${count} herramientas que usan ${t.label}`}
                        >
                          {content}
                        </button>
                      ) : (
                        <div className="flex items-baseline gap-2 py-1.5 text-[15px]">{content}</div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
          <span className="kicker">También trabajo con</span>
          <span className="text-muted-foreground">{also.join(" · ")}</span>
        </Reveal>
      </Page>
    </section>
  )
}
