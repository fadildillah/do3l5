export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
};

export function getCloudinaryUrl(publicId: string, options?: {
  width?: number;
  quality?: number;
}) {
  const { width = 1200, quality = 85 } = options || {};
  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/w_${width},q_${quality},f_auto/${publicId}`;
}