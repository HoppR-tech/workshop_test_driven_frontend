"use client"

import { X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PromoBannerProps {
  message: string
  ctaText?: string
  ctaHref?: string
  onCtaClick?: () => void
  variant?: "default" | "accent" | "dark"
  dismissible?: boolean
  className?: string
}

export function PromoBanner({
  message,
  ctaText,
  ctaHref,
  onCtaClick,
  variant = "default",
  dismissible = true,
  className,
}: PromoBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const variantStyles = {
    default: "bg-primary text-primary-foreground",
    accent: "bg-accent text-accent-foreground",
    dark: "bg-foreground text-background",
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center gap-4 px-4 py-3 text-sm font-medium rounded-lg",
        variantStyles[variant],
        className,
      )}
    >
      <div className="flex flex-1 items-center justify-center gap-4 text-center">
        <p className="text-balance">{message}</p>
        {ctaText && (
          <>
            {ctaHref ? (
              <Button
                asChild
                size="sm"
                variant={variant === "dark" ? "outline" : "secondary"}
                className={cn(
                  "shrink-0",
                  variant === "dark" && "border-background/20 bg-background text-foreground hover:bg-background/90",
                )}
              >
                <a href={ctaHref}>{ctaText}</a>
              </Button>
            ) : (
              <Button
                size="sm"
                variant={variant === "dark" ? "outline" : "secondary"}
                onClick={onCtaClick}
                className={cn(
                  "shrink-0",
                  variant === "dark" && "border-background/20 bg-background text-foreground hover:bg-background/90",
                )}
              >
                {ctaText}
              </Button>
            )}
          </>
        )}
      </div>
      {dismissible && (
        <button
          onClick={() => setIsVisible(false)}
          className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

