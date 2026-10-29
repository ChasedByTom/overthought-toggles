'use client'

import * as React from 'react'
import { motion, useAnimationControls, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

// Native handlers whose types clash with Motion's own animation and drag events.
type MotionConflicts = 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragOver'

export interface SeriousToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, MotionConflicts | 'onChange' | 'children' | 'defaultChecked'> {
  /** Visible label. Clicking it toggles the switch. */
  label: React.ReactNode
  /** Helper text under the label, linked with aria-describedby. */
  description?: React.ReactNode
  checked?: boolean
  defaultChecked?: boolean
  /**
   * Called with the next value. Return a promise to get a loading state.
   * If the promise rejects, the switch rolls back and shows `errorMessage`.
   */
  onCheckedChange?: (checked: boolean) => void | Promise<unknown>
  errorMessage?: React.ReactNode
  size?: 'sm' | 'md'
}

// Track has 2px padding, so travel = track width - 4 - knob.
const SIZES = {
  sm: { track: 'h-5 w-9', knob: 16, travel: 16, stretch: 4 },
  md: { track: 'h-6 w-11', knob: 20, travel: 20, stretch: 5 },
} as const

// Critically damped spring: fast, no overshoot. A settings switch should feel certain.
const SPRING = { type: 'spring', stiffness: 700, damping: 40, mass: 0.8 } as const

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return !!value && typeof (value as PromiseLike<unknown>).then === 'function'
}

export function SeriousToggle({
  label,
  description,
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  errorMessage = "Couldn't save. Switched back.",
  size = 'md',
  disabled,
  className,
  id,
  ...buttonProps
}: SeriousToggleProps) {
  const autoId = React.useId()
  const switchId = id ?? `serious-toggle-${autoId}`
  const descId = `${switchId}-description`
  const errorId = `${switchId}-error`

  // Works controlled (`checked`) or uncontrolled (`defaultChecked`), like a native input.
  const isControlled = checkedProp !== undefined
  const [uncontrolled, setUncontrolled] = React.useState(defaultChecked)
  // Optimistic value: the switch moves at once, even while the save is in flight.
  const [optimistic, setOptimistic] = React.useState<boolean | null>(null)
  const checked = optimistic ?? (isControlled ? checkedProp : uncontrolled)

  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [pressed, setPressed] = React.useState(false)

  const reduceMotion = useReducedMotion()
  const track = useAnimationControls()
  const s = SIZES[size]

  async function toggle() {
    if (disabled || pending) return
    const next = !checked
    setError(false)

    const result = onCheckedChange?.(next)
    if (!isPromiseLike(result)) {
      if (!isControlled) setUncontrolled(next)
      return
    }

    setOptimistic(next)
    setPending(true)
    try {
      await result
      if (!isControlled) setUncontrolled(next)
    } catch {
      setError(true)
      if (!reduceMotion) track.start({ x: [0, -4, 4, -2, 2, 0], transition: { duration: 0.4 } })
    } finally {
      setOptimistic(null)
      setPending(false)
    }
  }

  const describedBy = [description ? descId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('flex items-start justify-between gap-6', className)}>
      <div className="grid min-w-0 gap-0.5">
        <label
          htmlFor={switchId}
          className={cn(
            'text-sm leading-6 font-medium select-none',
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
          )}
        >
          {label}
        </label>
        {description ? (
          <p id={descId} className={cn('text-sm text-muted-foreground', disabled && 'opacity-50')}>
            {description}
          </p>
        ) : null}
        {/* Always mounted so screen readers pick up the message when it appears. */}
        <p id={errorId} aria-live="polite" className="text-sm text-destructive empty:hidden">
          {error ? errorMessage : null}
        </p>
      </div>

      <motion.button
        {...buttonProps}
        type="button"
        role="switch"
        id={switchId}
        aria-checked={checked}
        aria-busy={pending || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        animate={track}
        onClick={toggle}
        // Knob stretches while held, like a finger pressing into it.
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        onKeyDown={(e) => e.key === ' ' && setPressed(true)}
        onKeyUp={() => setPressed(false)}
        onBlur={() => setPressed(false)}
        className={cn(
          'relative mt-0.5 inline-flex shrink-0 items-center rounded-full p-0.5 outline-none',
          'transition-[background-color,box-shadow] duration-200',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
          // Off track is neutral-500 so it keeps 3:1 contrast against light and dark surfaces.
          checked ? 'bg-primary' : 'bg-neutral-500',
          error && 'ring-2 ring-destructive/50',
          pending ? 'cursor-progress' : 'cursor-pointer',
          s.track,
        )}
      >
        <motion.span
          aria-hidden
          className={cn(
            'pointer-events-none grid place-items-center rounded-full shadow-sm',
            checked ? 'bg-primary-foreground text-primary' : 'bg-white text-neutral-500',
          )}
          style={{ height: s.knob }}
          initial={false}
          animate={{
            width: s.knob + (pressed ? s.stretch : 0),
            x: checked ? s.travel - (pressed ? s.stretch : 0) : 0,
          }}
          transition={reduceMotion ? { duration: 0 } : SPRING}
        >
          {pending ? <Spinner size={s.knob - 8} /> : null}
        </motion.span>
      </motion.button>
    </div>
  )
}

function Spinner({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className="motion-safe:animate-spin">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
