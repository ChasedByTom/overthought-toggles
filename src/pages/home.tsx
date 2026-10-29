import { ToggleCard } from '@/site/toggle-card'
import { QuirkyDemo, SeriousDemo } from '@/site/demos'
import { installCommand } from '@/site/config'

export function HomePage() {
  return (
    <>
      <section className="grid gap-4 pt-16 pb-12 sm:pt-24">
        <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">Animated shadcn/ui toggles</p>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          One switch. Two personalities.
        </h1>
        <p className="max-w-xl text-base text-pretty text-muted-foreground">
          Every toggle here is built twice. The Serious one handles loading, errors, keyboard and screen readers, ready
          for production. The Quirky one has opinions. Install either with one command.
        </p>
      </section>

      <section aria-label="Toggles" className="grid gap-6 pb-24 lg:grid-cols-2">
        <ToggleCard
          title="Toggle Switch"
          docsHref="/docs/toggle-switch"
          modes={{
            serious: {
              blurb: 'Optimistic save with a loading knob. If the save fails, it switches back and tells you why.',
              demo: <SeriousDemo />,
              install: installCommand('serious-toggle'),
            },
            quirky: {
              blurb: 'Sleeps when off, wakes up when on. Flip it too fast and it refuses to be switched off.',
              demo: <QuirkyDemo />,
              install: installCommand('quirky-toggle'),
            },
          }}
        />
        <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          More toggles coming. Still overthinking them.
        </div>
      </section>
    </>
  )
}
