import { useEffect, useRef } from "react";
import { animationTime } from "../../../logic/animationConfiguration";
import { AnimationDelta } from "../types";
import React from "react";

type AnimationHandlerProps = {
    animationDeltas: Array<AnimationDelta> | null;
    setAnimationDeltas: (deltas: Array<AnimationDelta>) => void;
};

/**
 * Builds a floating clone of the source element positioned at its current
 * bounding rect. The clone inherits the source's classes and inline styles,
 * so it renders identically without needing to reconstruct card visuals here.
 */
function buildClone(source: HTMLElement, rect: DOMRect): HTMLElement {
    const clone = source.cloneNode(true) as HTMLElement;
    clone.removeAttribute("id");
    Object.assign(clone.style, {
        position: "fixed",
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        margin: "0",
        boxSizing: "border-box",
        pointerEvents: "none",
        zIndex: "1000",
        willChange: "transform",
        transformOrigin: "top left",
    });
    return clone;
}

/**
 * Runs one delta as a Web Animations API tween. Returns a promise that
 * resolves once the animation completes (or is cancelled).
 */
function runDelta(delta: AnimationDelta, duration: number): Promise<void> {
    return new Promise((resolve) => {
        // The wire type declares from/to as rects, but the server actually
        // sends element ids. Coerce here in one place.
        const fromId = delta.from as unknown as string;
        const toId = delta.to as unknown as string;

        const fromEl = document.getElementById(fromId);
        const toEl = document.getElementById(toId);

        if (!fromEl || !toEl) {
            console.error("AnimationHandler: element not found", { from: fromId, to: toId });
            resolve();
            return;
        }

        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();

        if (fromRect.width === 0 || toRect.width === 0) {
            resolve();
            return;
        }

        const dx = toRect.left - fromRect.left;
        const dy = toRect.top - fromRect.top;
        const scale = toRect.width / fromRect.width;

        const clone = buildClone(fromEl, fromRect);
        document.body.appendChild(clone);

        const anim = clone.animate(
            [
                { transform: "translate(0px, 0px) scale(1)" },
                { transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
            ],
            {
                duration,
                // Material "standard" easing — accelerates out, decelerates in.
                easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
                fill: "forwards",
            }
        );

        const cleanup = () => {
            clone.remove();
            resolve();
        };
        anim.onfinish = cleanup;
        anim.oncancel = cleanup;
    });
}

/**
 * Consumes the queue of pending animation deltas, playing all currently
 * queued deltas in parallel. Any deltas that arrive while a batch is
 * running are picked up on the next tick.
 */
export default function AnimationHandler({ animationDeltas, setAnimationDeltas }: AnimationHandlerProps) {
    const runningRef = useRef(false);

    useEffect(() => {
        if (runningRef.current) return;
        if (!animationDeltas || animationDeltas.length === 0) return;

        runningRef.current = true;
        const batch = animationDeltas;

        let cancelled = false;
        Promise.all(batch.map((d) => runDelta(d, animationTime))).then(() => {
            runningRef.current = false;
            if (cancelled) return;
            // Drop the deltas we just played; anything that arrived during
            // the batch stays in the queue and triggers the next effect run.
            setAnimationDeltas([]);
        });

        return () => {
            cancelled = true;
        };
    }, [animationDeltas, setAnimationDeltas]);

    return null;
}
