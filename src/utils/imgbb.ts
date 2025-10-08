import { API_KEYS } from "@/config/apiKeys";

/**
 * Upload an image to Imgbb
 * @param imageFile - File object or base64 string
 * @returns Object with image URL and other metadata
 */
export async function uploadToImgbb(imageFile: File | string): Promise<{
  url: string;
  displayUrl: string;
  deleteUrl: string;
  size: number;
}> {
  const formData = new FormData();
  
  if (typeof imageFile === 'string') {
    // If it's a base64 string
    formData.append('image', imageFile);
  } else {
    // If it's a File object
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });
    
    const base64 = await base64Promise;
    formData.append('image', base64);
  }

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEYS.IMGBB}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to upload image to Imgbb');
  }

  const data = await response.json();
  
  return {
    url: data.data.url,
    displayUrl: data.data.display_url,
    deleteUrl: data.data.delete_url,
    size: data.data.size,
  };
}
