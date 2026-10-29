import * as React from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { useTheme } from './theme'
import { CopyCommand } from './copy-command'
import { ArrowIcon, MoonIcon, SunIcon } from './icons'

export type Mode = 'serious' | 'quirky'

interface ToggleCardProps {
  title: string
  docsHref: string
  modes: Record<Mode, { blurb: string; demo: React.ReactNode; install: string }>
}

const MODES: Mode[] = ['serious', 'quirky']

export function ToggleCard({ title, docsHref, modes }: ToggleCardProps) {
  const [mode, setMode] = React.useState<Mode>('serious')
  const { theme } = useTheme()
  // null = follow the site theme. The card can flip just its own preview.
  const [previewTheme, setPreviewTheme] = React.useState<'light' | 'dark' | null>(null)
  const effective = previewTheme ?? theme
  const id = React.useId()

  return (
    <article className="overflow-hidden rounded-2xl border bg-card">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <ModeTabs id={id} value={mode} onChange={setMode} />
      </header>

      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${mode}`}
        className={cn('relative bg-background text-foreground', effective)}
      >
        <button
          type="button"
          onClick={() => setPreviewTheme(effective === 'dark' ? 'light' : 'dark')}
          className="absolute top-3 right-3 z-10 grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label={`Preview in ${effective === 'dark' ? 'light' : 'dark'} mode`}
        >
          {effective === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>

        <div className="grid min-h-72 place-items-center px-6 pt-14 pb-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-sm"
            >
              {modes[mode].demo}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <footer className="grid gap-3 border-t px-4 py-4">
        <p className="text-sm text-muted-foreground">{modes[mode].blurb}</p>
        <div className="flex flex-wrap items-center gap-2">
          <CopyCommand command={modes[mode].install} className="min-w-0 flex-1" />
          <Link
            to={docsHref}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Docs <ArrowIcon className="size-3.5" />
          </Link>
        </div>
      </footer>
    </article>
  )
}

function ModeTabs({ id, value, onChange }: { id: string; value: Mode; onChange: (m: Mode) => void }) {
  const refs = React.useRef<Record<string, HTMLButtonElement | null>>({})

  // Arrow keys move between tabs, as the WAI-ARIA tabs pattern expects.
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const next = MODES[(MODES.indexOf(value) + 1) % MODES.length]
    onChange(next)
    refs.current[next]?.focus()
  }

  return (
    <div role="tablist" aria-label="Mode" className="relative flex rounded-lg bg-muted p-0.5" onKeyDown={onKeyDown}>
      {MODES.map((m) => {
        const selected = m === value
        return (
          <button
            key={m}
            ref={(el) => {
              refs.current[m] = el
            }}
            id={`${id}-tab-${m}`}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={`${id}-panel`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(m)}
            className={cn(
              'relative h-7 rounded-md px-3 text-xs font-medium capitalize transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
              selected ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {selected ? (
              <motion.span
                layoutId={`${id}-pill`}
                className="absolute inset-0 rounded-md bg-background shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            ) : null}
            <span className="relative">{m}</span>
          </button>
        )
      })}
    </div>
  )
}
