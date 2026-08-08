import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch inline-flex shrink-0 items-center rounded-full border border-border/60 shadow-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer h-6 w-11 p-0.5 data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground/30 dark:data-[state=unchecked]:bg-slate-700",
        className
      )}
      {...props}>
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-white pointer-events-none block rounded-full shadow-md ring-0 transition-transform h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )} />
    </SwitchPrimitive.Root>
  );
}

export { Switch }
