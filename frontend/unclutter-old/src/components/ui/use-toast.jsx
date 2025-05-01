import { useEffect, useState } from "react"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

const actionTypes = {
    ADD_TOAST: "ADD_TOAST",
    UPDATE_TOAST: "UPDATE_TOAST",
    DISMISS_TOAST: "DISMISS_TOAST",
    REMOVE_TOAST: "REMOVE_TOAST",
}

let count = 0

function generateId() {
    count = (count + 1) % Number.MAX_VALUE
    return count.toString()
}

const toastTimeouts = new Map()

function addToRemoveQueue(toastId) {
    if (toastTimeouts.has(toastId)) {
        return
    }

    const timeout = setTimeout(() => {
        toastTimeouts.delete(toastId)
        dispatch({
            type: actionTypes.REMOVE_TOAST,
            toastId: toastId,
        })
    }, TOAST_REMOVE_DELAY)

    toastTimeouts.set(toastId, timeout)
}

export function useToast() {
    const [state, setState] = useState([])

    useEffect(() => {
        state.forEach((toast) => {
            if (toast.open) {
                addToRemoveQueue(toast.id)
            }
        })
    }, [state])

    function toast(props) {
        const id = generateId()

        const newToast = {
            ...props,
            id,
            open: true,
        }

        setState((prevState) => [...prevState, newToast])

        return id
    }

    function dismiss(toastId) {
        setState((prevState) =>
            prevState.map((toast) =>
                toast.id === toastId || toastId === undefined
                    ? {
                        ...toast,
                        open: false,
                    }
                    : toast
            )
        )
    }

    return {
        toast,
        dismiss,
        toasts: state,
    }
}