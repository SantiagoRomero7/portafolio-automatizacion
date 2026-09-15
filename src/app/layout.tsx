import type { Metadata, Viewport } from "next"
import { Fraunces, Inter_Tight, IBM_Plex_Mono } from "next/font/google"
import "./globals.css"

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
  display: "swap",
})

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
})

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Santiago Romero — Una semana de trabajo, en 15 segundos",
  description:
    "Desarrollador de automatizaciones en Cajasan. 25 herramientas entregadas que convierten procesos manuales de horas o días en segundos.",
  keywords: ["automatización", "RPA", "Python", "Power Automate", "Bucaramanga", "Santiago Romero"],
  openGraph: {
    title: "Santiago Romero — Automatización de procesos",
    description: "Tres semanas de trabajo manual, comprimidas en poco más de una hora.",
    images: ["/perfil.png"],
    locale: "es_CO",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#f2ede0",
}

// Aplica el tema guardado antes de pintar, para evitar el destello
const themeScript = `try{if(localStorage.getItem('tema')==='tinta')document.documentElement.classList.add('dark')}catch(e){}`

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${fraunces.variable} ${interTight.variable} ${plexMono.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="grain min-h-svh">
        {/* Filtros compartidos: bordes de sello y foto en dos tintas */}
        <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
          <filter id="tinta" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="7" result="ruido" />
            <feDisplacementMap in="SourceGraphic" in2="ruido" scale="2.4" />
          </filter>
          <filter id="duotono" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncR type="linear" slope="1.35" intercept="-0.14" />
              <feFuncG type="linear" slope="1.35" intercept="-0.14" />
              <feFuncB type="linear" slope="1.35" intercept="-0.14" />
            </feComponentTransfer>
            <feComponentTransfer>
              <feFuncR type="table" tableValues="0.086 0.949" />
              <feFuncG type="table" tableValues="0.075 0.929" />
              <feFuncB type="table" tableValues="0.051 0.878" />
            </feComponentTransfer>
          </filter>
        </svg>
        {children}
      </body>
    </html>
  )
}
