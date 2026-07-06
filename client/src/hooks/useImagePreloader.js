import { useEffect, useState } from "react";

export default function useImagePreloader(images) {
    const [imagesPreloaded, setImagesPreloaded] = useState(false);

    useEffect(() => {
        let isCancelled = false;

        async function effect() {
            if (isCancelled) return;

            const imagePromises = images.map((image) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.src = image;
                    img.onload = () => resolve(image);
                    img.onerror = () => resolve(null);
                });
            });

            await Promise.all(imagePromises);

            if (isCancelled) return;

            setImagesPreloaded(true);
        }

        effect();

        return () => {
            isCancelled = true;
        };
    }, [images]);

    return { imagesPreloaded };
}