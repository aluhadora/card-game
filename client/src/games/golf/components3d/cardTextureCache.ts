import * as THREE from "three";

/**
 * Synchronous card-texture cache.
 *
 * The 3D scene previously used drei's `useTexture`, which throws a
 * suspense promise whenever it sees a URL that hasn't fully loaded yet.
 * Because the `<Canvas>` Suspense boundary's fallback is null, every such
 * suspension unmounted the whole scene for a frame — the visible "flash"
 * whenever a card face was rendered.
 *
 * Loading textures directly through `THREE.TextureLoader` sidesteps
 * Suspense entirely: `load()` returns a `Texture` immediately and Three.js
 * updates it in place once the image resolves. Combined with a Map cache
 * this yields stable identity per URL (so React sees the same `map` prop
 * on re-render) and eliminates the flash.
 */
const loader = new THREE.TextureLoader();
const cache = new Map<string, THREE.Texture>();

export function getCardTexture(path: string): THREE.Texture {
    const cached = cache.get(path);
    if (cached) return cached;
    const tex = loader.load(path);
    // Match the color pipeline drei applies to card face images so
    // the swap from useTexture doesn't shift color reproduction.
    tex.colorSpace = THREE.SRGBColorSpace;
    cache.set(path, tex);
    return tex;
}

function allCardTexturePaths(): string[] {
    const suits = ["club", "diamond", "heart", "spade"];
    const ranks = [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "jack",
        "queen",
        "king",
    ];

    const faces = suits.flatMap((s) =>
        ranks.map((r) => `/images/cards/${s}_${r}.png`),
    );

    return [
        ...faces,
        "/images/cards/joker_black.png",
        "/images/cards/joker_red.png",
        "/images/cards/back.png",
        "/images/cards/card-base.png",
    ];
}

// Kick off loading of every card image at module import so textures are
// warm by the time the scene mounts.
allCardTexturePaths().forEach(getCardTexture);
