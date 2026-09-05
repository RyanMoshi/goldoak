import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: "section" | "div" | "article";
  /** Remove interior padding, e.g. when the card holds a list with its own dividers. */
  flush?: boolean;
}

/** White surface, hairline border, 10px radius. No shadow: containment, not elevation. */
export function Card({ as: Tag = "div", flush = false, className, ...props }: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-card border border-line bg-surface",
        flush ? "" : "p-5",
        className,
      )}
      {...props}
    />
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  /** Element rendered to the right of the title, e.g. a count or a link. */
  aside?: ReactNode;
  className?: string;
  /** Heading level for the title. */
  level?: 2 | 3;
  id?: string;
}

export function CardHeader({
  title,
  description,
  aside,
  className,
  level = 2,
  id,
}: CardHeaderProps) {
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <Heading id={id} className="font-serif text-[17px] leading-6 font-bold text-forest">
          {title}
        </Heading>
        {description ? (
          <p className="mt-0.5 text-[13px] leading-5 text-ink-muted">{description}</p>
        ) : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  );
}
