// src/components/ui/badge.jsx
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground hover:bg-primary/80",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-foreground border border-input",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

function Badge({
    className,
    variant,
    ...props
}) {
    return (
        <div
            className={cn(badgeVariants({ variant }), className)}
            {...props}
        />
    )
}

export { Badge, badgeVariants }