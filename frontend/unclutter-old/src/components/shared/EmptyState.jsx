// src/components/shared/EmptyState.jsx
import { Button } from "@/components/ui/button"

export default function EmptyState({
    title,
    description,
    actionLabel,
    onAction,
    icon: Icon
}) {
    return (
        <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                {Icon && <Icon className="h-10 w-10 text-muted-foreground mb-4" />}
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mb-4 mt-2 text-sm text-muted-foreground">
                    {description}
                </p>
                {actionLabel && onAction && (
                    <Button onClick={onAction}>
                        {actionLabel}
                    </Button>
                )}
            </div>
        </div>
    )
}



