import * as React from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { CheckIcon, CopyIcon } from './icons'

export function CopyCommand({ command, className }: { command: string; className?: string }) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  async function copy() {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 1600)
    } catch {}
  }

  React.useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <>
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy install command: ${command}`}
      className={cn(
        'group flex h-9 items-center gap-2 rounded-lg border bg-muted/50 px-3 text-left font-mono text-xs transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        className,
      )}
    >
      <span className="text-muted-foreground select-none">$</span>
      <span className="min-w-0 flex-1 truncate">{command}</span>
      <span className="relative grid size-4 shrink-0 place-items-center text-muted-foreground group-hover:text-foreground">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={copied ? 'done' : 'copy'}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 600, damping: 30 }}
          >
            {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
    <span className="sr-only" aria-live="polite">
      {copied ? 'Copied to clipboard' : ''}
    </span>
    </>
  )
}
