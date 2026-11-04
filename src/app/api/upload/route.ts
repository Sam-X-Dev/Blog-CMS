import { prisma } from "@/lib/prisma";
import { fail, handleApiError, ok } from "@/lib/api-response";
import {
  ALLOWED_FORMATS,
  ALLOWED_MIME_TYPES,
  MAX_IMAGE_BYTES,
  isCloudinaryReady,
  uploadImageBuffer,
} from "@/lib/cloudinary";
import { requireAdminApi } from "@/lib/auth";

// POST /api/upload — admin (login check: Samarth)
// Body: multipart/form-data with one field "file" (jpg, jpeg, png or webp, up to 10 MB).
// Uploads to Cloudinary, saves it in the Media table and returns the saved row.
export async function POST(request: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  if (!isCloudinaryReady()) return fail("Image upload isn't set up yet", 503);

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return fail('Send the image as form-data in a field called "file"', 400, {
      file: ["No file was sent"],
    });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_MIME_TYPES.includes(file.type) || !ALLOWED_FORMATS.split(",").includes(ext)) {
    return fail("Only JPG, JPEG, PNG and WebP images are allowed", 400, {
      file: ["Unsupported file type"],
    });
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return fail("Image is larger than 10 MB", 413, { file: ["File is too large"] });
  }

  try {
    const image = await uploadImageBuffer(Buffer.from(await file.arrayBuffer()));
    const media = await prisma.media.create({
      data: {
        url: image.url,
        publicId: image.publicId,
        width: image.width ?? null,
        height: image.height ?? null,
        format: image.format,
        bytes: image.bytes ?? null,
      },
    });
    return ok(media, "Image uploaded successfully", 201);
  } catch (error) {
    return handleApiError(error, "Media");
  }
}
