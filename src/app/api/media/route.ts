import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleApiError, ok } from "@/lib/api-response";
import {
  deleteImage,
  imageUrl,
  isCloudinaryReady,
  isGenuineUpload,
  MAX_IMAGE_BYTES,
  MEDIA_FOLDER,
} from "@/lib/cloudinary";
import { saveMediaSchema } from "@/lib/validations/media";

const PER_PAGE = 24;

// GET /api/media?page=1 — admin (login check: Samarth). Newest first, 24 per page.
export async function GET(request: Request) {
  const pageParam = Number(new URL(request.url).searchParams.get("page"));
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  try {
    const [items, total] = await Promise.all([
      prisma.media.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PER_PAGE,
        take: PER_PAGE,
      }),
      prisma.media.count(),
    ]);
    return ok(
      { items, total, page, totalPages: Math.max(1, Math.ceil(total / PER_PAGE)) },
      "Media fetched successfully",
    );
  } catch (error) {
    return handleApiError(error, "Media");
  }
}

// POST /api/media — admin (login check: Samarth)
// Called after the browser uploaded to Cloudinary. Checks the upload is real, then saves it.
export async function POST(request: Request) {
  if (!isCloudinaryReady()) return fail("Image upload isn't set up yet", 503);

  const body = await request.json().catch(() => null);
  if (!body) return fail("Request body must be valid JSON", 400);

  const parsed = saveMediaSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Invalid upload data", 400, z.flattenError(parsed.error).fieldErrors);
  }
  const { publicId, version, signature, format, width, height, bytes } = parsed.data;

  if (!publicId.startsWith(`${MEDIA_FOLDER}/`) || !isGenuineUpload(publicId, version, signature)) {
    return fail("This upload could not be verified. Please upload the image again.", 400);
  }

  try {
    if (bytes && bytes > MAX_IMAGE_BYTES) {
      await deleteImage(publicId);
      return fail("Image is larger than 10 MB", 413);
    }

    const data = {
      url: imageUrl(publicId, version, format),
      width: width ?? null,
      height: height ?? null,
      format,
      bytes: bytes ?? null,
    };
    // upsert: saving the same upload twice (e.g. a retried request) doesn't fail
    const media = await prisma.media.upsert({
      where: { publicId },
      update: data,
      create: { publicId, ...data },
    });
    return ok(media, "Image uploaded successfully", 201);
  } catch (error) {
    return handleApiError(error, "Media");
  }
}
