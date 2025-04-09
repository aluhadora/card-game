import useImagePreloader from "./useImagePreloader";

function allImages() {
    const images = import.meta.glob("/public/images/cards/*.png", { eager: true });
    // const images = [];
    const imageUrls = Object.keys(images).map(path => path.replace("/public", ""))
    console.log("Preloading images:", imageUrls);

    return imageUrls;
}

export default function useDeckPreloader() {
    const { imagesPreloaded } = useImagePreloader(allImages());

    return { imagesPreloaded };
}