import "server-only";
import { prisma } from "@/lib/prisma";

/** A published blog by id, or null (readers can only like, save or comment on live blogs). */
export function findPublishedBlog(blogId: string) {
  return prisma.blog.findFirst({
    where: { id: blogId, status: "PUBLISHED" },
    select: { id: true },
  });
}

/** Like and comment counts, plus whether this reader liked or saved the blog. */
export async function getEngagement(blogId: string, userId?: string) {
  const [likes, comments, liked, saved] = await Promise.all([
    prisma.blogLike.count({ where: { blogId } }),
    prisma.comment.count({ where: { blogId } }),
    userId
      ? prisma.blogLike.count({ where: { blogId, userId } }).then(Boolean)
      : Promise.resolve(false),
    userId
      ? prisma.savedBlog.count({ where: { blogId, userId } }).then(Boolean)
      : Promise.resolve(false),
  ]);
  return { likes, comments, liked, saved };
}
