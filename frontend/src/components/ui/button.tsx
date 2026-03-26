import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 disabled:pointer-events-none disabled:opacity-40 tracking-tight",
  {
    variants: {
      variant: {
        // Primary — electric lime on black
        default:
          "bg-[#D4FF33] text-[#0A0A0A] hover:bg-[#c8f020] shadow-[0_0_20px_rgba(212,255,51,0.4)] hover:shadow-[0_0_28px_rgba(212,255,51,0.6)] hover:-translate-y-px",
        // Yellow outline
        outline:
          "border border-[rgba(212,255,51,0.3)] text-[#D4FF33] bg-transparent hover:bg-[rgba(212,255,51,0.06)] hover:border-[rgba(212,255,51,0.6)]",
        // Ghost — white muted
        ghost:
          "text-[rgba(255,255,255,0.45)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] bg-transparent",
        // Destructive
        destructive:
          "bg-[#D4FF33] text-[#0A0A0A] hover:bg-[#c8f020]",
        // Filled yellow (alias)
        glow:
          "bg-[#D4FF33] text-[#0A0A0A] font-bold hover:bg-[#c8f020] shadow-[0_0_20px_rgba(212,255,51,0.4)] hover:-translate-y-px",
        // Secondary / muted
        secondary:
          "bg-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.6)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] hover:text-white",
        // Link
        link:
          "text-[#D4FF33] underline-offset-4 hover:underline bg-transparent p-0 h-auto",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm:      "h-8 px-4 text-xs",
        lg:      "h-12 px-7 text-base",
        icon:    "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
