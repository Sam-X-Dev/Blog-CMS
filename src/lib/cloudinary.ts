import "server-only";
import { v2 as cloudinary } from "cloudinary";
import type { UploadSignature } from "@/types/media";

/** Every upload goes into this Cloudinary folder, so the project's images stay together */
export const MEDIA_FOLDER = "blog-cms";
/** Cloudinary itself refuses any other file type (the list is part of the signature) */
export const ALLOWED_FORMATS = "jpg,jpeg,png,webp,gif,avif";
/** 10 MB, the Cloudinary free plan limit for one image */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function getConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  return { cloudName, apiKey, apiSecret };
}

export function isCloudinaryReady() {
  return getConfig() !== null;
}

/**
 * Permission slip for ONE upload, valid for about an hour.
 * The secret never leaves the server; the browser only gets the signature.
 */
export function createUploadSignature(): UploadSignature | null {
  const config = getConfig();
  if (!config) return null;

  const timestamp = Math.round(Date.now() / 1000);
  const params = { timestamp, folder: MEDIA_FOLDER, allowed_formats: ALLOWED_FORMATS };
  const signature = cloudinary.utils.api_sign_request(params, config.apiSecret);

  return {
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    timestamp,
    signature,
    folder: MEDIA_FOLDER,
    allowedFormats: ALLOWED_FORMATS,
  };
}

/** True only if Cloudinary really created this upload (its reply is signed with our secret). */
export function isGenuineUpload(publicId: string, version: number, signature: string) {
  if (!getConfig()) return false;
  // The SDK has this helper but its TypeScript types don't list it yet
  const utils = cloudinary.utils as typeof cloudinary.utils & {
    verify_api_response_signature: (
      publicId: string,
      version: number,
      signature: string,
    ) => boolean;
  };
  return utils.verify_api_response_signature(publicId, version, signature);
}

/** The image's public https link, built on the server (never trusted from the browser). */
export function imageUrl(publicId: string, version: number, format: string) {
  const config = getConfig();
  if (!config) throw new Error("Cloudinary is not configured");
  return `https://res.cloudinary.com/${config.cloudName}/image/upload/v${version}/${publicId}.${format}`;
}

/** Removes the file from Cloudinary. "not found" counts as done. */
export async function deleteImage(publicId: string) {
  if (!getConfig()) throw new Error("Cloudinary is not configured");
  const result = (await cloudinary.uploader.destroy(publicId, { invalidate: true })) as {
    result?: string;
  };
  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(`Cloudinary could not delete ${publicId}: ${result.result}`);
  }
}
