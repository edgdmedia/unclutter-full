
// src/components/shared/ErrorState.jsx
import { AlertCircle } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export default function ErrorState({
    title = "Something went wrong",
    message,
    onRetry
}) {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription className="mt-2">
                {message}
                {onRetry && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRetry}
                        className="mt-2"
                    >
                        Try again
                    </Button>
                )}
            </AlertDescription>
        </Alert>
    )
}