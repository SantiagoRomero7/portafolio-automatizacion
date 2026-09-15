"use client"

import { motion } from "framer-motion"
import { automations } from "@/data/automations"
import { cases, type Case } from "@/data/cases"
import { EASE, MaskLine, Page, Reveal } from "@/components/ui"
import { cn } from "@/lib/utils"

export function Cases() {
  return (
    <section id="casos" className="relative bg-secondary/50 py-28 md:py-40">
      <Page>
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <h2 className="display text-[clamp(3rem,8vw,8rem)] lg:col-span-8">
            <MaskLine inView>Cinco casos,</MaskLine>
            <MaskLine inView delay={0.08}>
              <em>contados despacio.</em>
            </MaskLine>
          </h2>
          <Reveal className="space-y-3 lg:col-span-4 lg:pb-3">
            <div className="kicker">03 — Casos</div>
            <p className="leading-relaxed text-muted-foreground">
              El archivo dice qué hace cada herramienta. Aquí está cómo se construyeron y qué costó cada una.
            </p>
          </Reveal>
        </div>

        <div className="mt-20">
          {cases.map((c, i) => (
            <CaseBlock key={c.id} c={c} i={i} />
          ))}
        </div>
      </Page>
    </section>
  )
}

function CaseBlock({ c, i }: { c: Case; i: number }) {
  const a = automations.find((x) => x.id === c.id)!
  const ratio = a.afterMin > 0 ? a.afterMin / a.beforeMin : 0

  return (
    <article id={`caso-${c.id}`} className="grid scroll-mt-20 gap-10 border-t border-foreground py-14 md:py-20 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-24">
          <div className="flex items-start justify-between gap-4">
            <span className="display text-[clamp(5rem,10vw,9rem)] leading-[0.8] text-accent">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="kicker mt-2 text-right leading-relaxed">
              {a.area}
              <br />
              Herramienta n.º {a.n}
            </span>
          </div>
          <div className="mt-10 space-y-4">
            <Bar label="Antes" value={a.before} width={1} hatch />
            <Bar label="Después" value={a.after} width={ratio} />
          </div>
          <div className="mt-6 font-mono text-[11px] leading-relaxed text-muted-foreground">{a.stack.join(" · ")}</div>
        </div>
      </div>

      <div className="lg:col-span-8">
        <Reveal>
          <h3 className="display text-[clamp(2.2rem,4.8vw,4.6rem)]">{c.title}</h3>
        </Reveal>
        <Reveal delay={0.05} className="mt-10 grid gap-8 md:grid-cols-2">
          <div>
            <div className="kicker mb-2">El problema</div>
            <p className="leading-relaxed">{c.problem}</p>
          </div>
          <div>
            <div className="kicker mb-2">Cómo se hacía</div>
            <p className="leading-relaxed text-muted-foreground">{c.manual}</p>
          </div>
        </Reveal>
        <Reveal delay={0.05} className="mt-10">
          <div className="kicker mb-3">Lo que construí</div>
          <ol className="divide-y divide-border border-y border-border">
            {c.build.map((b, j) => (
              <li key={b} className="flex gap-4 py-3 leading-relaxed">
                <span className="pt-1 font-mono text-xs text-accent">{String(j + 1).padStart(2, "0")}</span>
                <span>{b}</span>
              </li>
            ))}
          </ol>
        </Reveal>
        <Reveal delay={0.05} className="mt-10 bg-panel p-6 text-panel-foreground md:p-9">
          <div className="kicker mb-3 text-panel-muted">El detalle</div>
          <p className="font-display text-xl leading-snug md:text-2xl">{c.detail}</p>
        </Reveal>
        <Reveal
          delay={0.05}
          className={cn("mt-10 grid grid-cols-2 gap-6", c.numbers.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3")}
        >
          {c.numbers.map((n) => (
            <div key={n.label} className="border-t border-foreground pt-3">
              <div className="tabular font-mono text-2xl tracking-[-0.03em] md:text-3xl">{n.value}</div>
              <div className="mt-1 text-xs leading-snug text-muted-foreground">{n.label}</div>
            </div>
          ))}
        </Reveal>
      </div>
    </article>
  )
}

function Bar({ label, value, width, hatch }: { label: string; value: string; width: number; hatch?: boolean }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="kicker text-[10px]">{label}</span>
        <span className="text-right font-mono text-xs">{value}</span>
      </div>
      <div className="mt-1.5 h-3 bg-background">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: Math.max(width, 0.006) }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.4, ease: EASE, delay: hatch ? 0 : 0.5 }}
          className={cn("h-full origin-left", hatch ? "hatch text-foreground/60" : "bg-accent")}
        />
      </div>
    </div>
  )
}
