import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-canvas hover:bg-primary-strong shadow-[0_8px_24px_-8px_rgba(59,158,255,0.6)]",
  secondary: "bg-gold text-canvas-deep hover:brightness-95",
  ghost: "bg-transparent text-body hover:bg-white/5",
  outline: "border border-line-strong text-body hover:bg-white/5",
  danger: "bg-danger text-white hover:brightness-110",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-[12px]",
  md: "h-11 px-5 text-sm rounded-[14px]",
  lg: "h-13 px-7 text-base rounded-[16px]",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  asChild,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
