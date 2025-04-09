import { useEffect, useState } from "react";

export default function useImagePreloader(images) {
    const [imagesPreloaded, setImagesPreloaded] = useState(false);

    console.log("Preloading images2:", images);

    useEffect(() => {
        let isCancelled = false;

        async function effect() {
            console.log("Preloading images effect:", images, isCancelled);
            if (!isCancelled) return;

            const imagePromises = images.map((image) => {
                console.log("Preloading image:", image);
                return new Promise((resolve) => {
                    console.log("Preloading image2:", image);
                    const img = new Image();
                    img.src = image;
                    console.log("Preloading image:", image);
                    img.onload = () => resolve(image);
                    img.onerror = () => resolve(null); // Handle error case
                });
            });

            console.log("Promises:", imagePromises);

            await Promise.all(imagePromises);

            if (isCancelled) return;
            
            setImagesPreloaded(true);
        };

        effect();
    
        return () => {
            isCancelled = true;
        };
    }, [images]);

    return { imagesPreloaded };
}