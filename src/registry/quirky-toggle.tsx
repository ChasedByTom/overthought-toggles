'use client'

import * as React from 'react'
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

// Native handlers whose types clash with Motion's own animation and drag events.
type MotionConflicts = 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragOver'

export interface QuirkyToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, MotionConflicts | 'onChange' | 'children' | 'defaultChecked'> {
  label: React.ReactNode
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  /** How many flips inside `spamWindow` ms count as spam. */
  spamThreshold?: number
  spamWindow?: number
  /** What it says when you spam it. Cycles if you keep going. */
  complaints?: string[]
}

type Mood = 'asleep' | 'awake' | 'annoyed'

// Track 64x36 with 3px padding, knob 30, so travel = 64 - 6 - 30.
const TRAVEL = 28
// Underdamped spring: it overshoots and wobbles. That overshoot is the personality.
const SPRING = { type: 'spring', stiffness: 420, damping: 16 } as const
const SULK_MS = 1800

const DEFAULT_COMPLAINTS = ["okay, OKAY. I'm on.", "I said I'm on.", 'staying on. final answer.']

export function QuirkyToggle({
  label,
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  spamThreshold = 4,
  spamWindow = 1200,
  complaints = DEFAULT_COMPLAINTS,
  disabled,
  className,
  id,
  ...buttonProps
}: QuirkyToggleProps) {
  const autoId = React.useId()
  const switchId = id ?? `quirky-toggle-${autoId}`

  const isControlled = checkedProp !== undefined
  const [uncontrolled, setUncontrolled] = React.useState(defaultChecked)
  const checked = isControlled ? checkedProp : uncontrolled

  const [annoyed, setAnnoyed] = React.useState(false)
  const [complaint, setComplaint] = React.useState<string | null>(null)
  const [blink, setBlink] = React.useState(false)
  const flips = React.useRef<number[]>([])
  const complaintIndex = React.useRef(0)
  const sulkTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  const reduceMotion = useReducedMotion()
  const knob = useAnimationControls()
  const track = useAnimationControls()
  const mood: Mood = annoyed ? 'annoyed' : checked ? 'awake' : 'asleep'

  function setChecked(next: boolean) {
    if (!isControlled) setUncontrolled(next)
    onCheckedChange?.(next)
  }

  function complain() {
    setComplaint(complaints[complaintIndex.current % complaints.length])
    complaintIndex.current += 1
    if (!reduceMotion) track.start({ x: [0, -5, 5, -3, 3, 0], transition: { duration: 0.35 } })
    clearTimeout(sulkTimer.current)
    sulkTimer.current = setTimeout(() => {
      setAnnoyed(false)
      setComplaint(null)
      complaintIndex.current = 0
      flips.current = []
    }, SULK_MS)
  }

  function handleClick() {
    if (disabled) return
    // While sulking it ignores you, but tells you why.
    if (annoyed) return complain()

    const now = Date.now()
    flips.current = [...flips.current.filter((t) => now - t < spamWindow), now]

    if (flips.current.length >= spamThreshold) {
      setAnnoyed(true)
      if (!checked) setChecked(true)
      return complain()
    }
    setChecked(!checked)
  }

  // Hop when it wakes up. Skipped on first render so it doesn't hop on page load.
  const mounted = React.useRef(false)
  React.useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    if (checked && !reduceMotion) {
      knob.start({ y: [0, -6, 0], scale: [1, 1.12, 1], transition: { duration: 0.42, ease: 'easeOut' } })
    }
  }, [checked, reduceMotion, knob])

  // Blink every few seconds while awake.
  React.useEffect(() => {
    if (mood !== 'awake' || reduceMotion) return
    let timer: ReturnType<typeof setTimeout>
    const loop = () => {
      timer = setTimeout(() => {
        setBlink(true)
        setTimeout(() => setBlink(false), 130)
        loop()
      }, 2200 + Math.random() * 2400)
    }
    loop()
    return () => clearTimeout(timer)
  }, [mood, reduceMotion])

  React.useEffect(() => () => clearTimeout(sulkTimer.current), [])

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <label
        htmlFor={switchId}
        className={cn('text-sm font-medium select-none', disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')}
      >
        {label}
      </label>

      <div className="relative">
        <AnimatePresence>
          {complaint ? (
            <motion.div
              key={complaint}
              initial={{ opacity: 0, y: 6, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.9, transition: { duration: 0.15 } }}
              transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 22 }}
              className="pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2 rounded-xl bg-neutral-900 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-lg dark:bg-white dark:text-neutral-900"
              style={{ originY: 1 }}
            >
              {complaint}
              <span className="absolute top-full left-1/2 -ml-1 border-x-4 border-t-4 border-x-transparent border-t-neutral-900 dark:border-t-white" />
            </motion.div>
          ) : null}
        </AnimatePresence>
        {/* Screen readers hear the complaint too. */}
        <span className="sr-only" aria-live="polite">
          {complaint}
        </span>

        <motion.button
          {...buttonProps}
          type="button"
          role="switch"
          id={switchId}
          aria-checked={checked}
          disabled={disabled}
          animate={track}
          onClick={handleClick}
          className={cn(
            'relative flex h-9 w-16 shrink-0 items-center rounded-full p-[3px] outline-none',
            'transition-colors duration-500',
            'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-white dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-900',
            'disabled:cursor-not-allowed disabled:opacity-50',
            annoyed ? 'bg-rose-400' : checked ? 'bg-amber-400' : 'bg-indigo-950',
            'cursor-pointer',
          )}
        >
          {/* Night sky while it sleeps */}
          <AnimatePresence>
            {mood === 'asleep' ? (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="absolute top-[9px] right-[12px] size-[3px] rounded-full bg-white/80" />
                <span className="absolute top-[20px] right-[20px] size-[2px] rounded-full bg-white/60" />
                <span className="absolute top-[14px] right-[26px] size-[2px] rounded-full bg-white/40" />
              </motion.span>
            ) : null}
          </AnimatePresence>

          <motion.span
            aria-hidden
            className="pointer-events-none relative block size-[30px]"
            initial={false}
            animate={{ x: checked ? TRAVEL : 0 }}
            transition={reduceMotion ? { duration: 0 } : SPRING}
          >
            <motion.span animate={knob} className="block size-full rounded-full bg-white shadow-md">
              <Face mood={mood} blink={blink} />
            </motion.span>
            {mood === 'asleep' && !reduceMotion ? <Snores /> : null}
          </motion.span>
        </motion.button>
      </div>
    </div>
  )
}

const MOUTH: Record<Mood, string> = {
  asleep: 'M8.5 14.2 Q10 14.2 11.5 14.2',
  awake: 'M7 13 Q10 16.5 13 13',
  annoyed: 'M7.5 15 Q10 13 12.5 15',
}

function Face({ mood, blink }: { mood: Mood; blink: boolean }) {
  const eyeRy = mood === 'asleep' || blink ? 0.35 : 1.7
  const t = { duration: 0.18 }
  return (
    <svg viewBox="0 0 20 20" className="size-full text-neutral-800" fill="none">
      {mood === 'annoyed' ? (
        <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5.2 7.4 L7.6 8.9 L5.2 10.4" />
          <path d="M14.8 7.4 L12.4 8.9 L14.8 10.4" />
        </g>
      ) : (
        <g fill="currentColor">
          <motion.ellipse cx="6.6" cy="9" rx="1.25" initial={false} animate={{ ry: eyeRy }} transition={t} />
          <motion.ellipse cx="13.4" cy="9" rx="1.25" initial={false} animate={{ ry: eyeRy }} transition={t} />
        </g>
      )}
      <motion.circle
        cx="4.6"
        cy="12.2"
        r="1.5"
        fill="#fb7185"
        initial={false}
        animate={{ opacity: mood === 'awake' ? 0.55 : 0 }}
      />
      <motion.circle
        cx="15.4"
        cy="12.2"
        r="1.5"
        fill="#fb7185"
        initial={false}
        animate={{ opacity: mood === 'awake' ? 0.55 : 0 }}
      />
      <motion.path
        d={MOUTH[mood]}
        initial={false}
        animate={{ d: MOUTH[mood] }}
        transition={{ duration: 0.2 }}
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Snores() {
  return (
    <span className="pointer-events-none absolute -top-1 left-6">
      {[0, 1].map((i) => (
        <motion.span
          key={i}
          className="absolute text-[9px] font-semibold text-indigo-200"
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], x: [0, 4, 8], y: [0, -7, -14] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 1.2, ease: 'easeOut' }}
        >
          z
        </motion.span>
      ))}
    </span>
  )
}
