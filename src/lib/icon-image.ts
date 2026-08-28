export const ICON_SIZE = 256;

/** Resize any uploaded image to a square 256x256 app icon, returned as a data URL. */
export function resizeToAppIcon(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that image"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not decode that image"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = ICON_SIZE;
        canvas.height = ICON_SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas unavailable"));
        // cover-crop so the icon fills the square without stretching
        const scale = Math.max(ICON_SIZE / img.width, ICON_SIZE / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (ICON_SIZE - w) / 2, (ICON_SIZE - h) / 2, w, h);
        resolve(canvas.toDataURL("image/webp", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
