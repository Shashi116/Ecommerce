import cloudinary from './cloudinary';

export async function uploadImage(file) {
  if (!file || typeof file.arrayBuffer !== 'function' || file.size === 0) {
    return '';
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || 'application/octet-stream';
  const dataUri = `data:${mimeType};base64,${bytes.toString('base64')}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'saha-traditions/products'
  });

  return result.secure_url;
}
