import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  wrapperClassName?: string;
};

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  wrapperClassName?: string;
  options: Array<{ label: string; value: string }>;
};

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  wrapperClassName?: string;
};

export type TableColumn<T> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
};

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28 },
};

export function PageTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div {...fadeUp} className={className}>
      {children}
    </motion.div>
  );
}

export function SurfaceCard({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[8px] border border-zinc-200/80 bg-white shadow-[0_10px_30px_rgba(24,24,27,0.04)]",
        className,
      )}
      {...props}
    />
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        {eyebrow ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-[24px] font-semibold tracking-[-0.03em] text-zinc-950 sm:text-[26px]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-[13px] leading-6 text-zinc-500">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <SurfaceCard className="p-5">
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">
          {label}
        </p>
        <div className="flex items-end justify-between gap-3">
          <p className="font-display text-[27px] font-semibold tracking-[-0.04em] text-zinc-950">
            {value}
          </p>
          <span className="text-[11px] font-medium text-blue-700">{delta}</span>
        </div>
      </div>
    </SurfaceCard>
  );
}

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-200 disabled:text-blue-500",
    secondary:
      "border border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:text-blue-300",
    ghost: "text-blue-700 hover:bg-blue-50",
  };

  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-[6px] px-4 text-[13px] font-medium transition-colors",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function InputField({
  label,
  hint,
  className,
  wrapperClassName,
  ...props
}: FieldProps) {
  return (
    <label className={cn("block space-y-2", wrapperClassName)}>
      {label ? (
        <span className="text-[13px] font-medium text-zinc-700">{label}</span>
      ) : null}
      <input
        className={cn(
          "h-11 w-full rounded-[6px] border border-zinc-200 bg-white px-3 text-[13px] text-zinc-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
          className,
        )}
        {...props}
      />
      {hint ? <span className="text-xs text-zinc-400">{hint}</span> : null}
    </label>
  );
}

export function SelectField({
  label,
  hint,
  className,
  wrapperClassName,
  options,
  ...props
}: SelectProps) {
  return (
    <label className={cn("block space-y-2", wrapperClassName)}>
      {label ? (
        <span className="text-[13px] font-medium text-zinc-700">{label}</span>
      ) : null}
      <select
        className={cn(
          "h-11 w-full rounded-[6px] border border-zinc-200 bg-white px-3 text-[13px] text-zinc-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <span className="text-xs text-zinc-400">{hint}</span> : null}
    </label>
  );
}

export function TextAreaField({
  label,
  hint,
  className,
  wrapperClassName,
  ...props
}: TextAreaProps) {
  return (
    <label className={cn("block space-y-2", wrapperClassName)}>
      {label ? (
        <span className="text-[13px] font-medium text-zinc-700">{label}</span>
      ) : null}
      <textarea
        className={cn(
          "min-h-[120px] w-full rounded-[6px] border border-zinc-200 bg-white px-3 py-3 text-[13px] text-zinc-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
          className,
        )}
        {...props}
      />
      {hint ? <span className="text-xs text-zinc-400">{hint}</span> : null}
    </label>
  );
}

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "positive" | "warning" | "muted";
}) {
  const tones = {
    neutral: "bg-zinc-100 text-zinc-700",
    positive: "bg-blue-50 text-blue-700",
    warning: "bg-amber-50 text-amber-700",
    muted: "bg-blue-100 text-blue-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[6px] px-2.5 py-1 text-xs font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function SectionLabel({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-1">
      <h2 className="font-display text-[15px] font-semibold text-zinc-900">{title}</h2>
      {description ? (
        <p className="text-[13px] leading-6 text-zinc-500">{description}</p>
      ) : null}
    </div>
  );
}

export function DataTable<T extends { id: number | string }>({
  columns,
  rows,
  emptyText,
}: {
  columns: TableColumn<T>[];
  rows: T[];
  emptyText: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0 text-[13px]">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "border-b border-zinc-200 px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400",
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-zinc-50">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "border-b border-zinc-100 px-4 py-4 align-top text-[13px] text-zinc-700",
                      column.className,
                    )}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-sm text-zinc-400"
              >
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function AvatarName({
  name,
  subtext,
}: {
  name: string;
  subtext?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-blue-50 text-[13px] font-semibold text-blue-700">
        {name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)}
      </div>
      <div className="space-y-0.5">
        <p className="text-[13px] font-medium text-zinc-900">{name}</p>
        {subtext ? <p className="text-xs text-zinc-400">{subtext}</p> : null}
      </div>
    </div>
  );
}
