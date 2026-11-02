// Uploading images from the browser. The file goes straight to Cloudinary
// (with a one-time signature from our server), then we save the result in our database.
import { apiFetch } from "@/lib/api-client";
import type { MediaItem, UploadSignature } from "@/types/media";

/** For <input type="file" accept={IMAGE_ACCEPT}> */
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";
export const MAX_IMAGE_MB = 10;

/** Returns a friendly problem message, or null if the file is fine to upload. */
export function checkImageFile(file: File): string | null {
  if (!IMAGE_ACCEPT.split(",").includes(file.type)) {
    return `"${file.name}" isn't a supported image. Use JPG, PNG, WebP, GIF or AVIF.`;
  }
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    return `"${file.name}" is larger than ${MAX_IMAGE_MB} MB.`;
  }
  return null;
}

/** "my-trip_photo-01.jpg" -> "my trip photo 01" (a starting alt text) */
export function altFromFileName(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

/** 245760 -> "240 KB" */
export function formatBytes(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type CloudinaryReply = {
  public_id: string;
  version: number;
  signature: string;
  format: string;
  width?: number;
  height?: number;
  bytes?: number;
  error?: { message?: string };
};

/** XMLHttpRequest instead of fetch, because only XHR reports upload progress */
function sendToCloudinary(
  file: File,
  sig: UploadSignature,
  onProgress?: (percent: number) => void,
): Promise<CloudinaryReply> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", sig.apiKey);
    form.append("timestamp", String(sig.timestamp));
    form.append("signature", sig.signature);
    form.append("folder", sig.folder);
    form.append("allowed_formats", sig.allowedFormats);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let reply: CloudinaryReply | null = null;
      try {
        reply = JSON.parse(xhr.responseText) as CloudinaryReply;
      } catch {
        // handled below
      }
      if (xhr.status >= 200 && xhr.status < 300 && reply?.public_id) resolve(reply);
      else reject(new Error(reply?.error?.message || "Upload failed. Please try again."));
    };
    xhr.onerror = () => reject(new Error("Network error. Check your internet and try again."));
    xhr.send(form);
  });
}

/** Uploads one image and returns the saved MediaItem. Throws an Error with a friendly message. */
export async function uploadImage(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<MediaItem> {
  const problem = checkImageFile(file);
  if (problem) throw new Error(problem);

  const sig = await apiFetch<UploadSignature>("/api/media/sign", { method: "POST" });
  const reply = await sendToCloudinary(file, sig, onProgress);

  return apiFetch<MediaItem>("/api/media", {
    method: "POST",
    body: JSON.stringify({
      publicId: reply.public_id,
      version: reply.version,
      signature: reply.signature,
      format: reply.format,
      width: reply.width,
      height: reply.height,
      bytes: reply.bytes,
    }),
  });
}
