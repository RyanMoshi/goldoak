'use client'

import { Loader2 } from 'lucide-react'
import { useId, type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/**
 * The form kit every workspace form is built from, so a quote, a campaign and
 * a client invitation all behave the same way: one label style, a required
 * mark that is not colour-only, hint text under the control, the error in the
 * same place with `role="alert"`, and inputs at 16px on phones so iOS does
 * not zoom the page when a field takes focus.
 */

export const controlBase =
  'w-full rounded-control border border-line bg-surface text-ink placeholder:text-ink-faint transition-colors focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-ink-muted aria-[invalid=true]:border-error aria-[invalid=true]:ring-error text-[16px] sm:text-[14.5px]'

export const controlHeight = 'h-11'

interface FieldProps {
  label: string
  htmlFor?: string
  error?: string
  hint?: ReactNode
  required?: boolean
  optional?: boolean
  className?: string
  children: ReactNode
}

export function Field({ label, htmlFor, error, hint, required, optional, className, children }: FieldProps) {
  return (
    <div className={cn('min-w-0', className)}>
      <label htmlFor={htmlFor} className="flex items-baseline gap-1.5 text-[13px] font-semibold text-ink">
        <span>{label}</span>
        {required ? (
          <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-error" aria-hidden="true">
            required
          </span>
        ) : optional ? (
          <span className="text-[11px] font-medium text-ink-faint">optional</span>
        ) : null}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p className="mt-1.5 text-[12.5px] font-semibold text-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[12px] leading-4 text-ink-faint">{hint}</p>
      ) : null}
    </div>
  )
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: ReactNode; error?: string; optional?: boolean; wrapperClassName?: string }

/** A labelled text input; pass no label to use it inside your own Field. */
export function TextInput({ label, hint, error, required, optional, className, wrapperClassName, id, ...props }: InputProps) {
  const generated = useId()
  const inputId = id ?? generated
  const control = <input id={inputId} required={required} aria-invalid={error ? true : undefined} className={cn(controlBase, controlHeight, 'px-3', className)} {...props} />
  if (!label) return control
  return (
    <Field label={label} htmlFor={inputId} hint={hint} error={error} required={required} optional={optional} className={wrapperClassName}>
      {control}
    </Field>
  )
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: ReactNode; error?: string; optional?: boolean; wrapperClassName?: string }

export function TextArea({ label, hint, error, required, optional, className, wrapperClassName, id, rows = 4, ...props }: TextAreaProps) {
  const generated = useId()
  const inputId = id ?? generated
  const control = <textarea id={inputId} rows={rows} required={required} aria-invalid={error ? true : undefined} className={cn(controlBase, 'resize-y px-3 py-2.5 leading-6', className)} {...props} />
  if (!label) return control
  return (
    <Field label={label} htmlFor={inputId} hint={hint} error={error} required={required} optional={optional} className={wrapperClassName}>
      {control}
    </Field>
  )
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label?: string; hint?: ReactNode; error?: string; optional?: boolean; wrapperClassName?: string }

export function Select({ label, hint, error, required, optional, className, wrapperClassName, id, children, ...props }: SelectProps) {
  const generated = useId()
  const inputId = id ?? generated
  const control = (
    <select id={inputId} required={required} aria-invalid={error ? true : undefined} className={cn(controlBase, controlHeight, 'px-2.5', className)} {...props}>
      {children}
    </select>
  )
  if (!label) return control
  return (
    <Field label={label} htmlFor={inputId} hint={hint} error={error} required={required} optional={optional} className={wrapperClassName}>
      {control}
    </Field>
  )
}

/** A checkbox with its explanation, big enough to tap. */
export function CheckboxField({ name, label, description, defaultChecked, checked, onChange, value }: { name: string; label: string; description?: string; defaultChecked?: boolean; checked?: boolean; onChange?: (checked: boolean) => void; value?: string }) {
  const id = useId()
  return (
    <label htmlFor={id} className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-card border border-line bg-surface-3 p-3 text-[13.5px] text-ink transition-colors hover:border-ink-faint">
      <input
        id={id}
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        checked={checked}
        onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
        className="mt-0.5 size-4 shrink-0 accent-forest"
      />
      <span className="min-w-0">
        <span className="font-semibold">{label}</span>
        {description ? <span className="mt-0.5 block text-[12.5px] leading-4 text-ink-muted">{description}</span> : null}
      </span>
    </label>
  )
}

/** A titled group of fields inside a long form. */
export function FormSection({ title, description, children, className }: { title: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('border-t border-divider pt-5 first:border-t-0 first:pt-0', className)}>
      <h3 className="text-[13px] font-bold uppercase tracking-[0.08em] text-ink-muted">{title}</h3>
      {description ? <p className="mt-1 text-[13px] text-ink-muted">{description}</p> : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  )
}

/** Sticky on phones so the primary action is always reachable in a long form. */
export function FormActions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-col-reverse gap-2 border-t border-divider pt-4 sm:flex-row sm:items-center sm:justify-end', className)}>{children}</div>
}

interface SubmitProps {
  pending?: boolean
  children: ReactNode
  pendingLabel?: string
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  className?: string
  onClick?: () => void
  type?: 'submit' | 'button'
  formAction?: (formData: FormData) => void | Promise<void>
  name?: string
  value?: string
}

const VARIANTS = {
  primary: 'bg-forest text-white hover:bg-forest-700',
  secondary: 'border border-line bg-surface text-ink hover:border-ink-muted',
  danger: 'border border-error/30 bg-error/10 text-error hover:bg-error/15',
}

export function SubmitButton({ pending, children, pendingLabel, variant = 'primary', disabled, className, onClick, type = 'submit', formAction, name, value }: SubmitProps) {
  return (
    <button
      type={type}
      name={name}
      value={value}
      formAction={formAction}
      onClick={onClick}
      disabled={pending || disabled}
      aria-busy={pending || undefined}
      className={cn('inline-flex h-11 min-w-[8rem] items-center justify-center gap-2 rounded-control px-5 text-[14px] font-semibold focus-ring disabled:opacity-60', VARIANTS[variant], className)}
    >
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
      <span>{pending ? (pendingLabel ?? 'Working…') : children}</span>
    </button>
  )
}
