import {
    createContext,
    forwardRef,
    useContext,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
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

const AnimationRegistryContext = createContext<AnimationRegistryValue | null>(
    null,
);

export function AnimationRegistryProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const slotsRef = useRef<Map<string, Slot>>(new Map());

    const value = useMemo<AnimationRegistryValue>(
        () => ({
            register: (id, slot) => {
                slotsRef.current.set(id, slot);
                return () => {
                    if (slotsRef.current.get(id) === slot) {
                        slotsRef.current.delete(id);
                    }
                };
            },
            get: (id) => slotsRef.current.get(id),
        }),
        [],
    );

    return (
        <AnimationRegistryContext.Provider value={value}>
            {children}
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
