import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { cx } from "@/lib/cx";

type FieldShellProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
};

/** Visible label + control + hint/error, wired with aria-describedby by the controls below. */
function FieldShell({ id, label, error, hint, optional, className, children }: FieldShellProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-meta font-semibold text-strong">
        {label}
        {optional && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-meta text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-meta font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: string) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

const controlBase =
  "w-full rounded-sm border bg-surface text-sm text-strong placeholder:text-muted transition-colors duration-200 hover:border-strong";

function controlBorder(error?: string) {
  return error ? "border-2 border-danger" : "border-border-strong";
}

type SharedProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  icon?: LucideIcon;
  className?: string;
};

export function TextField({
  id,
  label,
  error,
  hint,
  optional,
  icon: Icon,
  className,
  ...inputProps
}: SharedProps & Omit<ComponentProps<"input">, "id" | "className">) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} optional={optional} className={className}>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          required={!optional}
          className={cx(controlBase, controlBorder(error), "h-12 px-4", Icon && "pr-11")}
          {...inputProps}
        />
        {Icon && (
          <Icon
            className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-primary-ink"
            aria-hidden="true"
          />
        )}
      </div>
    </FieldShell>
  );
}

export function TextAreaField({
  id,
  label,
  error,
  hint,
  optional,
  icon: Icon,
  className,
  ...textareaProps
}: SharedProps & Omit<ComponentProps<"textarea">, "id" | "className">) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} optional={optional} className={className}>
      <div className="relative">
        <textarea
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          required={!optional}
          rows={5}
          className={cx(controlBase, controlBorder(error), "block min-h-32 px-4 py-3", Icon && "pr-11")}
          {...textareaProps}
        />
        {Icon && <Icon className="pointer-events-none absolute top-4 right-4 size-4 text-primary-ink" aria-hidden="true" />}
      </div>
    </FieldShell>
  );
}

export function SelectField({
  id,
  label,
  error,
  hint,
  optional,
  className,
  options,
  placeholder,
  ...selectProps
}: Omit<SharedProps, "icon"> &
  Omit<ComponentProps<"select">, "id" | "className" | "children"> & {
    options: ReadonlyArray<{ value: string; label: string }>;
    placeholder: string;
  }) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} optional={optional} className={className}>
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          required={!optional}
          className={cx(controlBase, controlBorder(error), "h-12 appearance-none pr-11 pl-4")}
          {...selectProps}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-primary-ink"
          aria-hidden="true"
        />
      </div>
    </FieldShell>
  );
}

/** Polite live region summarising form errors or success. */
export function FormStatus({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  return (
    <p
      className={cx(
        "rounded-sm border px-4 py-3 text-sm font-medium",
        tone === "error" ? "border-danger/40 bg-danger/5 text-danger" : "border-primary/50 bg-primary-tint text-primary-ink",
      )}
    >
      {children}
    </p>
  );
}
