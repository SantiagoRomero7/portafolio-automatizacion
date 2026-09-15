"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { cn } from "@/lib/utils"

export const EASE = [0.16, 1, 0.3, 1] as const

export function Stamp({
  children,
  tone = "accent",
  size = "md",
  className,
}: {
  children: React.ReactNode
  tone?: "accent" | "positive" | "muted"
  size?: "md" | "lg"
  className?: string
}) {
  return (
    <span
      className={cn(
        "stamp",
        tone === "positive" && "stamp-positive",
        tone === "muted" && "stamp-muted",
        size === "lg" && "stamp-lg",
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/** Línea de titular que sube desde una máscara */
export function MaskLine({
  children,
  delay = 0,
  inView = false,
  className,
}: {
  children: React.ReactNode
  delay?: number
  inView?: boolean
  className?: string
}) {
  // Se observa el contenedor: la línea interna empieza recortada por la máscara y nunca "entraría" en vista
  const ref = useRef<HTMLSpanElement>(null)
  const seen = useInView(ref, { once: true, margin: "0px 0px -60px 0px" })
  const visible = !inView || seen
  return (
    <span ref={ref} className={cn("block overflow-hidden pb-[0.08em] -mb-[0.08em]", className)}>
      <motion.span
        className="block"
        initial={{ y: "110%" }}
        animate={{ y: visible ? "0%" : "110%" }}
        transition={{ duration: 1.1, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  )
}

/** Contenedor con los márgenes del sitio */
export function Page({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[88rem] px-5 sm:px-8 lg:px-12", className)}>{children}</div>
}
