import { cn } from "@/lib/utils";

/** SokaSafari Travel wordmark — gold "Soka", blue "Safari", on dark. */
export function Brand({
  className,
  subtitle = "Travel",
  size = "md",
}: {
  className?: string;
  subtitle?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const text = { sm: "text-base", md: "text-lg", lg: "text-2xl" }[size];
  const dot = { sm: "size-6", md: "size-8", lg: "size-10" }[size];
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid place-items-center rounded-[10px] bg-gradient-to-br from-gold to-amber font-black text-canvas-deep",
          dot,
        )}
      >
        S
      </span>
      <span className={cn("font-extrabold tracking-tight", text)}>
        <span className="text-gold">Soka</span>
        <span className="text-primary">Safari</span>
        {subtitle && (
          <span className="ml-1.5 align-middle text-[0.6em] font-semibold uppercase tracking-widest text-subtitle">
            {subtitle}
          </span>
        )}
      </span>
    </span>
  );
}
