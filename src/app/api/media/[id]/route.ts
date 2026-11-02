import { prisma } from "@/lib/prisma";
import { fail, handleApiError, ok } from "@/lib/api-response";
import { deleteImage } from "@/lib/cloudinary";

// DELETE /api/media/:id — admin only (protect in proxy.ts)
// Refuses while a blog still uses the image, so no blog ends up with a broken picture.
export async function DELETE(_request: Request, { params }: RouteContext<"/api/media/[id]">) {
  const { id } = await params;

  try {
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) return fail("Image not found", 404);

    const usedBy = await prisma.blog.count({
      where: {
        OR: [
          { thumbnail: { contains: media.publicId } },
          { content: { contains: media.publicId } },
        ],
      },
    });
    if (usedBy > 0) {
      return fail(
        `This image is used in ${usedBy} ${usedBy === 1 ? "blog" : "blogs"}. Remove it there first.`,
        409,
      );
    }

    await deleteImage(media.publicId);
    await prisma.media.delete({ where: { id } });
    return ok({ id }, "Image deleted successfully");
  } catch (error) {
    return handleApiError(error, "Image");
  }
}
