import { type ComponentPropsWithoutRef } from "react"

import { cn } from "@/lib/utils"

export interface AnimatedGradientTextProps extends ComponentPropsWithoutRef<"span"> {
  speed?: number
  colorFrom?: string
  colorTo?: string
}

export function AnimatedGradientText({
  children,
  className,
  speed = 1,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  style,
  ...props
}: AnimatedGradientTextProps) {
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(to right, ${colorFrom}, ${colorTo}, ${colorFrom})`,
        backgroundSize: `${speed * 300}% 100%`,
        ...style,
      }}
      className={cn(
        "animate-gradient inline-block bg-clip-text text-transparent",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
