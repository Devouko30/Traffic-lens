import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:     "bg-red-600 text-white border border-red-500/30",
        secondary:   "glass border-white/10 text-zinc-400",
        destructive: "bg-red-500/15 text-red-400 border border-red-500/20",
        outline:     "glass border-white/10 text-zinc-400",
        success:     "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
        warning:     "bg-amber-500/15 text-amber-400 border border-amber-500/20",
        north:       "bg-red-500/15 text-red-400 border border-red-500/20",
        south:       "bg-blue-500/15 text-blue-400 border border-blue-500/20",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
