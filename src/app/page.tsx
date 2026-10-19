import { Nav } from "@/components/Nav"
import { CommandPalette } from "@/components/CommandPalette"
import { Hero } from "@/components/sections/Hero"
import { Manifesto } from "@/components/sections/Manifesto"
import { Week } from "@/components/sections/Week"
import { Archive } from "@/components/sections/Archive"
import { Cases } from "@/components/sections/Cases"
import { Demo } from "@/components/sections/Demo"
import { Method } from "@/components/sections/Method"
import { Trace } from "@/components/sections/Trace"
import { About } from "@/components/sections/About"
import { Contact } from "@/components/sections/Contact"

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Manifesto />
        <Week />
        <Archive />
        <Cases />
        <Demo />
        <Method />
        <Trace />
        <About />
        <Contact />
      </main>
      <CommandPalette />
    </>
  )
}
