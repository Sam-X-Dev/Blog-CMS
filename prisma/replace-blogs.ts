/**
 * Replaces every blog in the database with a ready-to-read blog + a matching cover image.
 *
 *   npm run db:replace-blogs              → do it
 *   npm run db:replace-blogs -- --dry     → only show what would change
 *   npm run db:replace-blogs -- --delete-extra
 *                                         → also delete blogs beyond the 8 ready-made ones
 *
 * What it keeps on each existing blog: id, status (draft/published), publish date,
 * Trending / Featured switches and view counts. What it replaces: title, slug, description,
 * content, cover, category and tags.
 *
 * Covers: uploaded to Cloudinary (and added to the Media library) when the Cloudinary keys
 * are in .env; otherwise the files in public/thumbnails are used directly.
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";
import { slugify } from "@/lib/slugify";
import { READABLE_BLOGS } from "./data/readable-blogs";

const DRY = process.argv.includes("--dry");
const DELETE_EXTRA = process.argv.includes("--delete-extra");

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL or DIRECT_URL is missing in .env");
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

const CLOUDINARY_READY = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
    process.env.CLOUDINARY_API_KEY?.trim() &&
    process.env.CLOUDINARY_API_SECRET?.trim()
);

/** Uploads a cover to Cloudinary (same name every time, so re-running doesn't make copies). */
async function coverUrl(file: string): Promise<string> {
  const localUrl = `/thumbnails/${file}`;
  if (!CLOUDINARY_READY || DRY) return localUrl;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!.trim(),
    api_key: process.env.CLOUDINARY_API_KEY!.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET!.trim(),
    secure: true,
  });

  try {
    const filePath = path.join(process.cwd(), "public", "thumbnails", file);
    const dataUri = `data:image/webp;base64,${readFileSync(filePath).toString("base64")}`;
    const res = await cloudinary.uploader.upload(dataUri, {
      folder: "blog-cms",
      public_id: `thumbnails/${file.replace(/\.[^.]+$/, "")}`,
      overwrite: true,
      resource_type: "image",
    });
    const data = {
      url: res.secure_url,
      width: res.width ?? null,
      height: res.height ?? null,
      format: res.format,
      bytes: res.bytes ?? null,
    };
    await prisma.media.upsert({
      where: { publicId: res.public_id },
      update: data,
      create: { publicId: res.public_id, ...data },
    });
    return res.secure_url;
  } catch (err) {
    console.warn(`  ! Cloudinary upload failed for ${file}, using the local file instead.`, err);
    return localUrl;
  }
}

async function categoryId(name: string) {
  const slug = slugify(name);
  const category = await prisma.category.upsert({
    where: { slug },
    update: {},
    create: { name, slug },
  });
  return category.id;
}

async function tagIds(names: string[]) {
  const ids: { id: string }[] = [];
  for (const name of names) {
    const slug = slugify(name);
    const tag = await prisma.tag.upsert({ where: { slug }, update: {}, create: { name, slug } });
    ids.push({ id: tag.id });
  }
  return ids;
}

async function main() {
  const existing = await prisma.blog.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true, status: true },
  });

  console.log(`Found ${existing.length} blog(s) in the database.`);
  console.log(
    CLOUDINARY_READY && !DRY
      ? "Covers will be uploaded to Cloudinary."
      : "Covers will use the files in public/thumbnails."
  );
  if (DRY) console.log("DRY RUN: nothing will be saved.\n");

  const toUpdate = existing.slice(0, READABLE_BLOGS.length);
  const extra = existing.slice(READABLE_BLOGS.length);

  // Step 1: give the blogs we replace a temporary slug, so new slugs never clash with old ones
  if (!DRY && toUpdate.length) {
    await prisma.$transaction(
      toUpdate.map((b) =>
        prisma.blog.update({ where: { id: b.id }, data: { slug: `tmp-${b.id}` } })
      )
    );
  }

  // Step 2: write the new content
  for (const [i, blog] of READABLE_BLOGS.entries()) {
    const target = toUpdate[i];
    const label = target ? `"${target.title}" → "${blog.title}"` : `NEW: "${blog.title}"`;
    console.log(`${i + 1}. ${label}`);
    if (DRY) continue;

    const data = {
      title: blog.title,
      slug: blog.slug,
      description: blog.description,
      content: blog.content.trim(),
      thumbnail: await coverUrl(blog.cover),
      categoryId: await categoryId(blog.category),
    };
    const tags = await tagIds(blog.tags);

    if (target) {
      await prisma.blog.update({
        where: { id: target.id },
        data: { ...data, tags: { set: tags } },
      });
    } else {
      // Not enough existing blogs: add the rest as published, one day apart
      await prisma.blog.create({
        data: {
          ...data,
          status: "PUBLISHED",
          publishedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          tags: { connect: tags },
        },
      });
    }
  }

  // Blogs beyond the 8 ready-made ones
  if (extra.length) {
    console.log(`\n${extra.length} more blog(s) were not replaced:`);
    extra.forEach((b) => console.log(`  - "${b.title}" (${b.status})`));
    if (DELETE_EXTRA && !DRY) {
      await prisma.blog.deleteMany({ where: { id: { in: extra.map((b) => b.id) } } });
      console.log("  Deleted them (--delete-extra).");
    } else {
      console.log("  Run again with --delete-extra to delete them.");
    }
  }

  const drafts = toUpdate.filter((b) => b.status !== "PUBLISHED").length;
  if (drafts) {
    console.log(`\nNote: ${drafts} of the replaced blogs are drafts, so they won't show on the website.`);
  }
  console.log(DRY ? "\nDry run finished." : "\nDone. Refresh the website.");
}

main()
  .catch((e) => {
    console.error("Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
