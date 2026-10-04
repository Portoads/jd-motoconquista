import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'dark' | 'light' | 'outline' | 'outline-light' | 'ghost' | 'danger' | 'whatsapp'
type Size = 'sm' | 'md' | 'lg' | 'icon'

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px select-none'

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-600 shadow-[0_8px_24px_-12px_rgb(214_33_43/0.7)]',
  dark: 'bg-ink text-white hover:bg-graphite-800',
  light: 'bg-white text-ink hover:bg-graphite-100',
  outline: 'border border-graphite-200 bg-white text-graphite-900 hover:border-graphite-900',
  'outline-light': 'border border-white/25 text-white hover:border-white hover:bg-white/5',
  ghost: 'text-graphite-700 hover:bg-graphite-100 hover:text-graphite-900',
  danger: 'bg-white text-brand-700 border border-brand/30 hover:bg-brand-50',
  whatsapp: 'bg-[#1fae5b] text-white hover:bg-[#178f4a]',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-[0.95rem]',
  icon: 'h-10 w-10',
}

interface CommonProps {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
  iconRight?: ReactNode
  className?: string
  children?: ReactNode
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string): string {
  return cn(base, variants[variant], sizes[size], className)
}

export const Button = forwardRef<HTMLButtonElement, CommonProps & ButtonHTMLAttributes<HTMLButtonElement>>(
  function Button({ variant = 'primary', size = 'md', loading, icon, iconRight, className, children, disabled, ...rest }, ref) {
    return (
      <button ref={ref} className={buttonClass(variant, size, className)} disabled={disabled || loading} {...rest}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : icon}
        {children}
        {iconRight}
      </button>
    )
  },
)

type LinkButtonProps = CommonProps & { to: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>

export function LinkButton({ to, variant = 'primary', size = 'md', icon, iconRight, className, children, ...rest }: LinkButtonProps) {
  const cls = buttonClass(variant, size, className)
  if (/^(https?:|mailto:|tel:)/.test(to)) {
    return (
      <a href={to} className={cls} target={to.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" {...rest}>
        {icon}
        {children}
        {iconRight}
      </a>
    )
  }
  return (
    <Link to={to} className={cls} {...rest}>
      {icon}
      {children}
      {iconRight}
    </Link>
  )
}
