/** One uploaded image, as returned by /api/media */
export type MediaItem = {
  id: string;
  url: string;
  publicId: string;
  width: number | null;
  height: number | null;
  format: string | null;
  bytes: number | null;
  createdAt: string;
};

export type MediaPage = {
  items: MediaItem[];
  total: number;
  page: number;
  totalPages: number;
};

/** What the browser needs to upload one file straight to Cloudinary */
export type UploadSignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  allowedFormats: string;
};
