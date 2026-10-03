import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { cn } from '../../lib/utils'

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return <CheckboxPrimitive.Root data-slot="checkbox" className={cn('flex size-5 shrink-0 items-center justify-center border border-current focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current', className)} {...props}>
    <CheckboxPrimitive.Indicator><Check className="size-4" strokeWidth={1.5} /></CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
}

export { Checkbox }
