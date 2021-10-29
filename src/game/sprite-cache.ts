const spriteCache = new Map<string, ImageBitmap>();
window.addEventListener('DOMContentLoaded', function () {
  const images = Array.from(document.getElementsByClassName("preload")) as HTMLImageElement[];
  console.log("spriteCache", images);
  images.forEach(img => {
    img.onload = () => {
      console.log("img", img.width, img.height);
      window.createImageBitmap(img).then(sprite => {
        console.log("cache", img.src);
        spriteCache.set(img.src.slice(img.src.indexOf("resource")), sprite);
      });
    }
  });
});

export {
  spriteCache,

}