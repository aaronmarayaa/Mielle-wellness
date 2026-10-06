import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-3 whitespace-nowrap border-0 font-normal transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/75',
        outline: 'border-0 bg-white text-primary hover:bg-primary hover:text-primary-foreground',
        ghost: 'border-0 bg-transparent hover:bg-primary/10',
        light: 'border-0 bg-white text-primary hover:bg-primary hover:text-primary-foreground',
      },
      size: {
        default: 'min-h-12 px-7 py-3 text-base',
        lg: 'min-h-14 px-8 py-4 text-lg',
        icon: 'size-12 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

type ButtonProps = React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp data-slot="button" data-variant={variant ?? 'default'} className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
