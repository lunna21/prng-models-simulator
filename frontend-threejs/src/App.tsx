import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { Button } from './components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './components/ui/card'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 text-foreground">
      <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-4 py-10 text-center md:gap-8 md:py-14">
        <div className="relative">
          <img src={heroImg} className="relative z-0 h-auto w-[170px]" width="170" height="179" alt="" />
          <img
            src={reactLogo}
            className="absolute inset-x-0 top-[34px] z-10 mx-auto h-7 [transform:perspective(2000px)_rotateZ(300deg)_rotateX(44deg)_rotateY(39deg)_scale(1.4)]"
            alt="React logo"
          />
          <img
            src={viteLogo}
            className="absolute inset-x-0 top-[107px] z-0 mx-auto h-[26px] w-auto [transform:perspective(2000px)_rotateZ(300deg)_rotateX(40deg)_rotateY(39deg)_scale(0.8)]"
            alt="Vite logo"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Get started</h1>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <Button onClick={() => setCount((count) => count + 1)}>
          Count is {count}
        </Button>
      </section>

      <div className="relative mx-auto w-full max-w-5xl border-t border-border">
        <span className="absolute -top-[5px] left-0 h-0 w-0 border-y-[5px] border-r-0 border-l-[5px] border-y-transparent border-l-border" />
        <span className="absolute -top-[5px] right-0 h-0 w-0 border-y-[5px] border-r-[5px] border-l-0 border-y-transparent border-r-border" />
      </div>

      <section className="mx-auto grid w-full max-w-5xl grid-cols-1 border-x border-b border-border md:grid-cols-2">
        <Card className="rounded-none border-0 border-r border-border shadow-none">
          <CardHeader>
            <svg className="mb-2 h-[22px] w-[22px]" role="presentation" aria-hidden="true">
              <use href="/icons.svg#documentation-icon"></use>
            </svg>
            <CardTitle>Documentation</CardTitle>
            <CardDescription>Your questions, answered</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2 md:justify-start">
              <Button asChild variant="secondary" className="gap-2">
                <a href="https://vite.dev/" target="_blank" rel="noreferrer">
                  <img className="h-[18px]" src={viteLogo} alt="" />
                  Explore Vite
                </a>
              </Button>
              <Button asChild variant="secondary" className="gap-2">
                <a href="https://react.dev/" target="_blank" rel="noreferrer">
                  <img className="h-[18px] w-[18px]" src={reactLogo} alt="" />
                  Learn more
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none border-0 shadow-none md:border-l-0">
          <CardHeader>
            <svg className="mb-2 h-[22px] w-[22px]" role="presentation" aria-hidden="true">
              <use href="/icons.svg#social-icon"></use>
            </svg>
            <CardTitle>Connect with us</CardTitle>
            <CardDescription>Join the Vite community</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button asChild variant="outline" className="justify-start gap-2 sm:justify-center">
                <a href="https://github.com/vitejs/vite" target="_blank" rel="noreferrer">
                  <svg className="h-[18px] w-[18px]" role="presentation" aria-hidden="true">
                    <use href="/icons.svg#github-icon"></use>
                  </svg>
                  GitHub
                </a>
              </Button>
              <Button asChild variant="outline" className="justify-start gap-2 sm:justify-center">
                <a href="https://chat.vite.dev/" target="_blank" rel="noreferrer">
                  <svg className="h-[18px] w-[18px]" role="presentation" aria-hidden="true">
                    <use href="/icons.svg#discord-icon"></use>
                  </svg>
                  Discord
                </a>
              </Button>
              <Button asChild variant="outline" className="justify-start gap-2 sm:justify-center">
                <a href="https://x.com/vite_js" target="_blank" rel="noreferrer">
                  <svg className="h-[18px] w-[18px]" role="presentation" aria-hidden="true">
                    <use href="/icons.svg#x-icon"></use>
                  </svg>
                  X.com
                </a>
              </Button>
              <Button asChild variant="outline" className="justify-start gap-2 sm:justify-center">
                <a href="https://bsky.app/profile/vite.dev" target="_blank" rel="noreferrer">
                  <svg className="h-[18px] w-[18px]" role="presentation" aria-hidden="true">
                    <use href="/icons.svg#bluesky-icon"></use>
                  </svg>
                  Bluesky
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="relative mx-auto h-12 w-full max-w-5xl border-t border-border md:h-20">
        <span className="absolute -top-[5px] left-0 h-0 w-0 border-y-[5px] border-r-0 border-l-[5px] border-y-transparent border-l-border" />
        <span className="absolute -top-[5px] right-0 h-0 w-0 border-y-[5px] border-r-[5px] border-l-0 border-y-transparent border-r-border" />
      </div>
    </main>
  )
}

export default App
