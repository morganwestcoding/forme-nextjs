/**
 * Shared Cloudinary configuration and helpers.
 */

export const UPLOAD_PRESET = 'cs0am6m7';
export const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}`;

/**
 * Upload a file (image or video) to Cloudinary via unsigned upload.
 * Returns the parsed JSON response from Cloudinary.
 */
export async function uploadToCloudinary(
  file: Blob,
  folder: string,
  resourceType: 'image' | 'video' | 'auto' = 'image',
): Promise<{ public_id: string; secure_url: string; resource_type: string; format: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const res = await fetch(`${CLOUDINARY_UPLOAD_URL}/${resourceType}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Cloudinary upload failed: ${res.status}`);
  }

  return res.json();
}

/**
 * Build a Cloudinary transform URL from a public_id and transform string.
 * e.g. buildTransformUrl('uploads/profiles/abc123', 'q_auto:good,f_auto,w_400,h_400,c_fill,g_face')
 */
export function buildTransformUrl(publicId: string, transforms: string): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`;
}
