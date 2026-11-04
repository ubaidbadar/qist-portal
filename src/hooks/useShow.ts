import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useOverlay } from "./useOverlay";

/** How long the "close" state lasts, so exit animations can play before unmounting. */
const EXIT_DURATION = 300;

export type ShowState = "active" | "close" | "";

export type ShowTools = {
    state: ShowState;
    open: (event?: { currentTarget: EventTarget }) => void;
    close: () => void;
}

export default function useShow(initialState?: ShowState): ShowTools {
    const [state, setState] = useState<ShowState>(initialState || "");
    const exitTimerRef = useRef<number | undefined>(undefined);
    const openerRef = useRef<HTMLElement | null>(null);
    const isActive = state === "active";

    const open: ShowTools["open"] = (event) => {
        if (!isActive) {
            const opener = event?.currentTarget ?? document.activeElement;
            openerRef.current = opener instanceof HTMLElement ? opener : null;
        }
        window.clearTimeout(exitTimerRef.current);
        setState("active");
    };

    const close = () => {
        window.clearTimeout(exitTimerRef.current);
        setState("close");
        const opener = openerRef.current;
        openerRef.current = null;
        if (opener?.isConnected) opener.focus({ preventScroll: true });
        exitTimerRef.current = window.setTimeout(() => setState(""), EXIT_DURATION);
    };

    
    const closeOnBack = useEffectEvent(close);
    useEffect(() => {
        if (!isActive) return;

        const handlePopState = () => closeOnBack();
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [isActive]);

    useEffect(() => () => window.clearTimeout(exitTimerRef.current), []);

    useOverlay(isActive, close);

    return { state, open, close };
}
