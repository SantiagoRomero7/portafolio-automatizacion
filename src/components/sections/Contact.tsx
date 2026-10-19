"use client"

import { useState } from "react"
import { ArrowUpRight, Check, Copy } from "lucide-react"
import { contact } from "@/data/contact"
import { useModKey } from "@/lib/site"
import { MaskLine, Page, Reveal } from "@/components/ui"

const links = [
  { label: "LinkedIn", value: "santiago-romero", href: contact.linkedin },
  { label: "GitHub", value: "SantiagoRomero7", href: contact.github },
  { label: "WhatsApp", value: contact.phone, href: contact.whatsapp },
  { label: "Ubicación", value: contact.location },
]

export function Contact() {
  const [copied, setCopied] = useState(false)
  const mod = useModKey()

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contact.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <section id="contacto" className="relative overflow-hidden pb-8 pt-28 md:pt-40">
      <Page>
        <div className="kicker">08 — Contacto</div>
        <h2 className="display mt-6 text-[clamp(2.6rem,8vw,8.75rem)]">
          <MaskLine inView>¿Qué proceso le está</MaskLine>
          <MaskLine inView delay={0.08}>robando horas</MaskLine>
          <MaskLine inView delay={0.16}>
            <em className="text-accent">a tu equipo?</em>
          </MaskLine>
        </h2>

        <Reveal className="mt-14 grid gap-12 border-t border-foreground pt-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="max-w-md leading-relaxed text-muted-foreground">
              Cuéntame cómo se hace hoy, con qué archivos y cuánto tarda. Te respondo con una idea de cómo lo
              automatizaría.
            </p>
            <a
              href={`mailto:${contact.email}`}
              className="link-ink mt-6 inline-block break-all font-display text-[clamp(1.6rem,3.8vw,3.25rem)] leading-tight"
            >
              {contact.email}
            </a>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={`mailto:${contact.email}`} className="btn btn-solid">
                Escribirme <ArrowUpRight />
              </a>
              <button type="button" onClick={copy} className="btn" aria-live="polite">
                {copied ? (
                  <>
                    Copiado <Check />
                  </>
                ) : (
                  <>
                    Copiar correo <Copy />
                  </>
                )}
              </button>
            </div>
          </div>
          <dl className="space-y-3 font-mono text-sm lg:col-span-5">
            {links.map((l) => (
              <div key={l.label} className="flex items-baseline gap-2">
                <dt className="text-muted-foreground">{l.label}</dt>
                <span className="leader" />
                <dd>
                  {l.href ? (
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="link-ink">
                      {l.value}
                    </a>
                  ) : (
                    l.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <div
          aria-hidden
          className="display mt-24 select-none whitespace-nowrap text-[23vw] leading-[0.78] tracking-[-0.06em] md:mt-32"
        >
          Romero<span className="text-accent">.</span>
        </div>

        <footer className="kicker mt-6 flex flex-col gap-2 border-t border-foreground pt-5 text-[10px] sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} Santiago Romero</span>
          <span>Hecho a mano en Bucaramanga, con algo de automatización</span>
          <span>{mod} K · Índice</span>
        </footer>
      </Page>
    </section>
  )
}
