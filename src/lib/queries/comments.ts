import "server-only";
import { prisma } from "@/lib/prisma";

export type CommentData = {
  id: string;
  content: string;
  createdAt: Date;
  user: { name: string };
  /** true when the logged-in reader wrote it (they may delete it) */
  mine: boolean;
};

/** Comments on one blog, newest first. */
export async function getBlogComments(blogId: string, userId?: string, take = 50) {
  const rows = await prisma.comment.findMany({
    where: { blogId },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      content: true,
      createdAt: true,
      userId: true,
      user: { select: { name: true } },
    },
  });
  return rows.map(({ userId: author, ...c }) => ({ ...c, mine: author === userId }));
}

/** Latest comments on all blogs, for the admin Comments page. */
export function getAdminComments(take = 100) {
  return prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
      blog: { select: { title: true, slug: true, status: true } },
    },
  });
}

/** Reader accounts with what each one did, newest first, for the admin Readers page. */
export function getReaders(take = 200) {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: { select: { likes: true, saves: true, comments: true } },
    },
  });
}
