# Overthought Toggles

One switch. Two personalities.

A small library of animated [shadcn/ui](https://ui.shadcn.com) toggles. Every toggle is built twice:

- **Serious**: production-ready. Loading, error rollback, disabled, keyboard, screen readers, reduced motion.
- **Quirky**: the same contract, with opinions.

Live site: https://overthought-toggles.pages.dev

## Install

```bash
npx shadcn@latest add https://overthought-toggles.pages.dev/r/serious-toggle.json
npx shadcn@latest add https://overthought-toggles.pages.dev/r/quirky-toggle.json
```

## Stack

React, TypeScript, Tailwind CSS v4, Motion, Vite. Components ship through a shadcn registry (`registry.json`, built to `public/r`). Deployed on Cloudflare Pages.

## Design decisions

- **Native button + `role="switch"`.** Gets focus, Enter and Space for free. No extra dependency like Radix.
- **Optimistic updates.** The switch moves at once. If `onCheckedChange` returns a promise, the knob shows a spinner; if it rejects, the switch rolls back and announces why.
- **Controlled or uncontrolled.** `checked` or `defaultChecked`, same as a native input.
- **Springs, not durations.** An interrupted toggle keeps its momentum. Serious is critically damped (no overshoot); Quirky is underdamped (it wobbles). Same engine, different damping.
- **Contrast.** The off track keeps at least 3:1 against light and dark surfaces (WCAG 1.4.11).
- **Reduced motion.** Springs become instant and decorative loops are skipped.

## Develop

```bash
npm install
npm run dev
npm run build   # builds the registry, type-checks, then builds the site
```

Made by [Jerry Jose](https://chasedbytom.com).
