import * as React from 'react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'
import { installCommand } from '@/site/config'
import { CopyCommand } from '@/site/copy-command'
import { QuirkyDemo, SeriousDemo } from '@/site/demos'
import seriousSource from '@/registry/serious-toggle.tsx?raw'
import quirkySource from '@/registry/quirky-toggle.tsx?raw'

const SERIOUS_USAGE = `import { SeriousToggle } from "@/components/ui/serious-toggle"

export function Settings() {
  return (
    <SeriousToggle
      label="Email alerts"
      description="Get notified when an order fills."
      defaultChecked
      // Return a promise: the knob shows a spinner,
      // and a rejected promise switches it back.
      onCheckedChange={(on) => api.updatePrefs({ emailAlerts: on })}
    />
  )
}`

const QUIRKY_USAGE = `import { QuirkyToggle } from "@/components/ui/quirky-toggle"

export function Wake() {
  const [on, setOn] = React.useState(false)
  return <QuirkyToggle label="Morning mode" checked={on} onCheckedChange={setOn} />
}`

type Prop = [name: string, type: string, def: string, note: string]

const SERIOUS_PROPS: Prop[] = [
  ['label', 'ReactNode', 'required', 'Visible label. Clicking it toggles the switch.'],
  ['description', 'ReactNode', '', 'Helper text, linked with aria-describedby.'],
  ['checked', 'boolean', '', 'Controlled value.'],
  ['defaultChecked', 'boolean', 'false', 'Starting value when uncontrolled.'],
  ['onCheckedChange', '(checked) => void | Promise', '', 'Return a promise for loading and rollback.'],
  ['errorMessage', 'ReactNode', '"Couldn\'t save. Switched back."', 'Shown and announced when the promise rejects.'],
  ['size', '"sm" | "md"', '"md"', ''],
  ['disabled', 'boolean', 'false', ''],
]

const QUIRKY_PROPS: Prop[] = [
  ['label', 'ReactNode', 'required', 'Visible label.'],
  ['checked', 'boolean', '', 'Controlled value.'],
  ['defaultChecked', 'boolean', 'false', ''],
  ['onCheckedChange', '(checked) => void', '', ''],
  ['spamThreshold', 'number', '4', 'Flips inside spamWindow that count as spam.'],
  ['spamWindow', 'number', '1200', 'In milliseconds.'],
  ['complaints', 'string[]', '3 lines', 'What it says while it sulks. Cycles.'],
]

export function ToggleSwitchDocs() {
  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <article className="grid max-w-3xl gap-14 pt-12 pb-24">
      <header className="grid gap-3">
        <Link to="/" className="w-fit text-sm text-muted-foreground hover:text-foreground">
          ← All toggles
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Toggle Switch</h1>
        <p className="text-muted-foreground">
          A binary on/off control for settings that apply right away. Two versions, same accessibility contract.
        </p>
      </header>

      <Section title="Serious">
        <Preview>
          <SeriousDemo />
        </Preview>
        <SubHeading>Install</SubHeading>
        <CopyCommand command={installCommand('serious-toggle')} />
        <SubHeading>Usage</SubHeading>
        <Code>{SERIOUS_USAGE}</Code>
        <SubHeading>Props</SubHeading>
        <PropsTable rows={SERIOUS_PROPS} />
        <SubHeading>States</SubHeading>
        <List
          items={[
            'Off, on, and pressed. The knob stretches while held, then springs to the other side.',
            'Loading. The switch moves at once (optimistic), the knob shows a spinner, and aria-busy is set. Extra clicks are ignored.',
            'Error. If the save fails, it switches back, shakes once, and shows a message linked to the switch.',
            'Disabled. Dimmed, not focusable, label shows a not-allowed cursor.',
          ]}
        />
        <Source code={seriousSource} />
      </Section>

      <Section title="Quirky">
        <Preview>
          <QuirkyDemo />
        </Preview>
        <SubHeading>Install</SubHeading>
        <CopyCommand command={installCommand('quirky-toggle')} />
        <SubHeading>Usage</SubHeading>
        <Code>{QUIRKY_USAGE}</Code>
        <SubHeading>Props</SubHeading>
        <PropsTable rows={QUIRKY_PROPS} />
        <SubHeading>Moods</SubHeading>
        <List
          items={[
            'Asleep (off). Eyes shut, night sky, a couple of z’s drift up.',
            'Awake (on). Hops when it wakes, blushes, blinks every few seconds.',
            'Annoyed. Flip it 4 times in 1.2 seconds and it forces itself on, sulks for a moment, and tells you about it. Screen readers hear the complaint too.',
          ]}
        />
        <Source code={quirkySource} />
      </Section>

      <Section title="Accessibility">
        <List
          items={[
            'Native button with role="switch" and aria-checked, so it gets focus, Enter and Space for free.',
            'Label is a real <label>, so clicking the text toggles it.',
            'Visible focus ring on keyboard focus only (focus-visible).',
            'Off track keeps at least 3:1 contrast against the page in light and dark.',
            'With reduced motion on, springs become instant and decorative loops are skipped.',
          ]}
        />
        <PropsTable
          head={['Key', 'Action']}
          rows={[
            ['Space', 'Toggle'],
            ['Enter', 'Toggle'],
            ['Tab', 'Move focus'],
          ]}
        />
      </Section>

      <Section title="Motion">
        <List
          items={[
            'Serious uses a stiff, critically damped spring. It lands without overshoot, because a setting should feel certain.',
            'Quirky uses a loose spring that overshoots and wobbles. Same engine, lower damping, more personality.',
            'Springs over fixed durations, so an interrupted toggle keeps its momentum instead of restarting.',
          ]}
        />
      </Section>
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4">
      <h2 className="border-b pb-2 text-xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  )
}

const SubHeading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="mt-4 text-sm font-semibold">{children}</h3>
)

const Preview = ({ children }: { children: React.ReactNode }) => (
  <div className="grid min-h-64 place-items-center rounded-2xl border bg-card p-8">
    <div className="w-full max-w-sm">{children}</div>
  </div>
)

function Code({ children, className }: { children: string; className?: string }) {
  return (
    <pre className={cn('overflow-x-auto rounded-xl border bg-muted/50 p-4 font-mono text-xs leading-relaxed', className)}>
      <code>{children}</code>
    </pre>
  )
}

function Source({ code }: { code: string }) {
  return (
    <details className="group mt-4 rounded-xl border">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium select-none">View source</summary>
      <Code className="max-h-[32rem] rounded-none border-0 border-t">{code}</Code>
    </details>
  )
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="grid list-disc gap-2 pl-5 text-sm text-muted-foreground marker:text-border">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  )
}

function PropsTable({ rows, head = ['Prop', 'Type', 'Default', 'Notes'] }: { rows: string[][]; head?: string[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 text-xs text-muted-foreground">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="border-t align-top">
              {r.map((c, i) => (
                <td key={i} className={cn('px-4 py-2', i === 0 ? 'font-mono text-xs' : i < 3 ? 'font-mono text-xs text-muted-foreground' : 'text-muted-foreground')}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
