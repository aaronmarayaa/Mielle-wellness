import * as React from 'react'
import { cn } from '../../lib/utils'

function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return <input data-slot="input" className={cn('flex min-h-12 w-full min-w-0 border-0 border-b border-current/50 bg-transparent py-3 text-base focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current disabled:opacity-50', className)} {...props} />
}

export { Input }
