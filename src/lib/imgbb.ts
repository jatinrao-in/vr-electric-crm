/**
 * ImgBB Image Upload & 16:9 Aspect Ratio Client-Side Processor
 * API Key: b294d5cf960a25961006970bbeb037a7
 */

const IMGBB_API_KEY = 'b294d5cf960a25961006970bbeb037a7';
const IMGBB_UPLOAD_URL = `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`;

export interface ProcessedImageResult {
  blob: Blob;
  previewUrl: string;
  width: number;
  height: number;
}

/**
 * Crops and resizes any uploaded image file to exact 16:9 widescreen ratio
 * using HTML Canvas before uploading to save bandwidth and ensure uniform cards.
 */
export async function cropTo16By9(file: File, targetWidth = 1280): Promise<ProcessedImageResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const targetHeight = Math.round((targetWidth * 9) / 16); // exact 16:9
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get 2D canvas context'));
          return;
        }

        // Fill background with white in case of transparent pngs
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // Calculate aspect ratios for center crop / cover
        const srcAspect = img.width / img.height;
        const targetAspect = 16 / 9;

        let srcX = 0;
        let srcY = 0;
        let srcW = img.width;
        let srcH = img.height;

        if (srcAspect > targetAspect) {
          // Source is wider than 16:9 -> crop horizontal edges
          srcW = img.height * targetAspect;
          srcX = (img.width - srcW) / 2;
        } else {
          // Source is taller than 16:9 -> crop vertical edges
          srcH = img.width / targetAspect;
          srcY = (img.height - srcH) / 2;
        }

        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetWidth, targetHeight);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas toBlob conversion failed'));
              return;
            }
            const previewUrl = URL.createObjectURL(blob);
            resolve({
              blob,
              previewUrl,
              width: targetWidth,
              height: targetHeight,
            });
          },
          'image/jpeg',
          0.88 // 88% quality keeps size typically < 250KB
        );
      };
      img.onerror = () => reject(new Error('Failed to load image file into memory'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a file or 16:9 processed blob to ImgBB
 */
export async function uploadToImgBB(
  fileOrBlob: File | Blob,
  fileName = 'scooter-16x9.jpg'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('image', fileOrBlob, fileName);

    const response = await fetch(IMGBB_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.success && result.data) {
      // Prefer display_url or url
      const hostedUrl = result.data.display_url || result.data.url;
      return { success: true, url: hostedUrl };
    } else {
      const errorMsg = result.error?.message || 'ImgBB upload rejected the file.';
      return { success: false, error: errorMsg };
    }
  } catch (err: any) {
    console.error('ImgBB API Upload error:', err);
    return {
      success: false,
      error: err.message || 'Network error while uploading image to ImgBB.',
    };
  }
}
