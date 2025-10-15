import { ArrowRight, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'

function App() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <section className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-sm text-muted-foreground backdrop-blur">
          <Rocket className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <span>Tailwind CSS v4 + shadcn/ui starter</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Build polished React UI faster
          </h1>
          <p className="mx-auto max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
            Tailwind&apos;s utility workflow pairs with reusable shadcn/ui components.
            Drop in primitives, theme them with CSS tokens, and ship consistent
            interfaces in minutes.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button className="gap-2 px-6">
            Launch the workshop
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
          <Button variant="outline" className="px-6">
            Browse components
          </Button>
        </div>
      </section>
    </main>
  )
}

export default App
