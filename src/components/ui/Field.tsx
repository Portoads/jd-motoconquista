import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export const controlClass =
  'block w-full rounded-md border border-graphite-200 bg-white px-3.5 text-[0.95rem] text-graphite-900 placeholder:text-graphite-400 transition-colors focus:border-graphite-900 focus:outline-none focus:ring-2 focus:ring-graphite-900/10 disabled:bg-graphite-50 disabled:text-graphite-500'

interface FieldProps {
  label?: string
  hint?: string
  error?: string | null
  required?: boolean
  className?: string
  children: (id: string) => ReactNode
}

export function Field({ label, hint, error, required, className, children }: FieldProps) {
  const id = useId()
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-graphite-800">
          {label}
          {required && <span className="ml-0.5 text-brand">*</span>}
        </label>
      )}
      {children(id)}
      {error ? (
        <p className="text-xs font-medium text-brand-700" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-graphite-500">{hint}</p>
      ) : null}
    </div>
  )
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...rest }, ref) {
  return <input ref={ref} className={cn(controlClass, 'h-11', className)} {...rest} />
})

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        controlClass,
        "h-11 appearance-none bg-[url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%235d626b' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")] bg-[right_0.75rem_center] bg-no-repeat pr-9",
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  )
})

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...rest },
  ref,
) {
  return <textarea ref={ref} className={cn(controlClass, 'min-h-28 py-3 leading-relaxed', className)} {...rest} />
})

export function Checkbox({ label, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label className={cn('inline-flex cursor-pointer items-center gap-2.5 text-sm text-graphite-800', className)}>
      <input type="checkbox" className="h-4 w-4 rounded border-graphite-300 accent-brand" {...rest} />
      {label}
    </label>
  )
}
