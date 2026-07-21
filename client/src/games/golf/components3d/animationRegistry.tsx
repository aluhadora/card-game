import {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
import * as THREE from "three";

/**
 * A slot is a named 3D anchor point that the animation handler can target.
 * We store a callable that returns the current world position so callers
 * always read the up-to-date value (which matters if the scene animates or
 * layout changes at runtime).
 */
type Slot = {
    getWorldPos: () => THREE.Vector3;
};

type AnimationRegistryValue = {
    register: (id: string, slot: Slot) => () => void;
    get: (id: string) => Slot | undefined;
};

type BusyAnchorsUpdater = {
    markBusy: (ids: string[]) => void;
    clearBusy: (ids: string[]) => void;
};

const AnimationRegistryContext = createContext<AnimationRegistryValue | null>(
    null,
);

/**
 * The set of anchor IDs whose animated overlays are currently in flight.
 * Static `CardComponent`s wired to a busy anchor hide themselves so the
 * animation isn't visually duplicated by the underlying steady-state card.
 */
const BusyAnchorsContext = createContext<Set<string>>(new Set());
const BusyAnchorsUpdaterContext = createContext<BusyAnchorsUpdater>({
    markBusy: () => {},
    clearBusy: () => {},
});

/**
 * Anchor IDs ending with this suffix are resolved to a synthetic point
 * offset from the base anchor. Used by "push" style animations that need
 * a staging position adjacent to a play-area slot without registering an
 * extra `<AnchorPoint>` per slot.
 */
const NEIGHBOR_SUFFIX = "-neighbor";
const NEIGHBOR_OFFSET = new THREE.Vector3(0, 1.5, 0.3);

export function AnimationRegistryProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const slotsRef = useRef<Map<string, Slot>>(new Map());
    const [busyAnchors, setBusyAnchors] = useState<Set<string>>(
        () => new Set(),
    );

    const registry = useMemo<AnimationRegistryValue>(
        () => ({
            register: (id, slot) => {
                slotsRef.current.set(id, slot);
                return () => {
                    if (slotsRef.current.get(id) === slot) {
                        slotsRef.current.delete(id);
                    }
                };
            },
            get: (id) => {
                const direct = slotsRef.current.get(id);
                if (direct) return direct;
                if (id.endsWith(NEIGHBOR_SUFFIX)) {
                    const baseId = id.slice(0, -NEIGHBOR_SUFFIX.length);
                    const base = slotsRef.current.get(baseId);
                    if (!base) return undefined;
                    return {
                        getWorldPos: () =>
                            base
                                .getWorldPos()
                                .add(NEIGHBOR_OFFSET),
                    };
                }
                return undefined;
            },
        }),
        [],
    );

    const markBusy = useCallback((ids: string[]) => {
        if (ids.length === 0) return;
        setBusyAnchors((prev) => {
            const next = new Set(prev);
            for (const id of ids) next.add(id);
            return next;
        });
    }, []);

    const clearBusy = useCallback((ids: string[]) => {
        if (ids.length === 0) return;
        setBusyAnchors((prev) => {
            const next = new Set(prev);
            for (const id of ids) next.delete(id);
            return next;
        });
    }, []);

    const busyUpdater = useMemo<BusyAnchorsUpdater>(
        () => ({ markBusy, clearBusy }),
        [markBusy, clearBusy],
    );

    return (
        <AnimationRegistryContext.Provider value={registry}>
            <BusyAnchorsUpdaterContext.Provider value={busyUpdater}>
                <BusyAnchorsContext.Provider value={busyAnchors}>
                    {children}
                </BusyAnchorsContext.Provider>
            </BusyAnchorsUpdaterContext.Provider>
        </AnimationRegistryContext.Provider>
    );
}

export function useAnimationRegistry(): AnimationRegistryValue {
    const ctx = useContext(AnimationRegistryContext);
    if (!ctx) {
        throw new Error(
            "useAnimationRegistry must be used within AnimationRegistryProvider",
        );
    }
    return ctx;
}

export function useAnimationBusyUpdater(): BusyAnchorsUpdater {
    return useContext(BusyAnchorsUpdaterContext);
}

/**
 * Subscribe a `CardComponent` (or any consumer) to an anchor's "busy"
 * status. When `id` is undefined, always returns false so callers can
 * pass through an optional anchor id without conditional hooks.
 */
export function useIsAnchorBusy(id?: string): boolean {
    const busy = useContext(BusyAnchorsContext);
    if (!id) return false;
    return busy.has(id);
}

type AnchorPointProps = {
    id: string;
    position?: [number, number, number];
};

/**
 * Invisible group that registers its world position under `id`. Place it
 * as a child of whatever transform matches the visual slot (e.g. inside
 * the same parent mesh that holds the real card component). The
 * animation handler tweens between anchor world positions.
 */
export const AnchorPoint = forwardRef<THREE.Group, AnchorPointProps>(
    function AnchorPoint({ id, position }, ref) {
        const localRef = useRef<THREE.Group>(null);
        useImperativeHandle(ref, () => localRef.current as THREE.Group);
        const registry = useAnimationRegistry();

        useEffect(() => {
            const group = localRef.current;
            if (!group) return;
            return registry.register(id, {
                getWorldPos: () => {
                    const v = new THREE.Vector3();
                    group.getWorldPosition(v);
                    return v;
                },
            });
        }, [id, registry]);

        return <group ref={localRef} position={position} />;
    },
);
