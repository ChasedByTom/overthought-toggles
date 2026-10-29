import { BrowserRouter, Link, Route, Routes } from 'react-router'
import { MotionConfig } from 'motion/react'
import { ThemeProvider, useTheme } from '@/site/theme'
import { GITHUB_URL, PORTFOLIO_URL } from '@/site/config'
import { GithubIcon, MoonIcon, SunIcon } from '@/site/icons'
import { HomePage } from '@/pages/home'
import { ToggleSwitchDocs } from '@/pages/docs-toggle-switch'

export default function App() {
  return (
    <ThemeProvider>
      {/* Site-wide: honour the OS "reduce motion" setting. */}
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <div className="mx-auto min-h-dvh max-w-5xl px-4 sm:px-6">
            <SiteHeader />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/docs/toggle-switch" element={<ToggleSwitchDocs />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </main>
            <footer className="flex flex-wrap justify-between gap-2 border-t py-8 text-sm text-muted-foreground">
              <span>
                Overthought by{' '}
                <a href={PORTFOLIO_URL} className="text-foreground underline-offset-4 hover:underline">
                  Jerry Jose
                </a>
              </span>
              <span>React, Tailwind, shadcn/ui, Motion</span>
            </footer>
          </div>
        </BrowserRouter>
      </MotionConfig>
    </ThemeProvider>
  )
}

function SiteHeader() {
  const { theme, toggleTheme } = useTheme()
  const iconBtn =
    'grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
  return (
    <header className="flex h-16 items-center justify-between">
      <Link to="/" className="flex items-center gap-2 text-sm font-semibold">
        <img src="/favicon.svg" alt="" className="size-5 dark:invert" />
        Overthought Toggles
      </Link>
      <nav className="flex items-center gap-1">
        <a href={GITHUB_URL} className={iconBtn} aria-label="GitHub repository">
          <GithubIcon />
        </a>
        <button type="button" onClick={toggleTheme} className={iconBtn} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </nav>
    </header>
  )
}
