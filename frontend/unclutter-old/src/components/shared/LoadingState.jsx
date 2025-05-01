// src/components/shared/LoadingState.jsx
import { Loader2 } from "lucide-react"

export default function LoadingState({ message = "Loading..." }) {
    return (
        <div className="flex h-[450px] shrink-0 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">{message}</p>
            </div>
        </div>
    )
}