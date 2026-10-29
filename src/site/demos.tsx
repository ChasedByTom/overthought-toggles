import * as React from 'react'
import { SeriousToggle } from '@/registry/serious-toggle'
import { QuirkyToggle } from '@/registry/quirky-toggle'

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function SeriousDemo() {
  const [failNext, setFailNext] = React.useState(false)

  // Fake API call so the loading and rollback states are visible.
  async function save() {
    await wait(900)
    if (failNext) {
      setFailNext(false)
      throw new Error('Network error')
    }
  }

  return (
    <div className="grid gap-5 rounded-xl border bg-background p-5 shadow-sm">
      <SeriousToggle
        label="Email alerts"
        description="Get notified when an order fills."
        defaultChecked
        onCheckedChange={save}
      />
      <SeriousToggle label="Two-factor login" description="Managed by your admin." defaultChecked disabled />
      <div className="border-t pt-4">
        <SeriousToggle
          size="sm"
          label={<span className="text-muted-foreground">Make the next save fail</span>}
          checked={failNext}
          onCheckedChange={setFailNext}
        />
      </div>
    </div>
  )
}

export function QuirkyDemo() {
  return (
    <div className="grid justify-items-center gap-6 pt-6">
      <QuirkyToggle label="Morning mode" />
      <p className="text-xs text-muted-foreground">Tip: try clicking it a lot. Quickly.</p>
    </div>
  )
}
