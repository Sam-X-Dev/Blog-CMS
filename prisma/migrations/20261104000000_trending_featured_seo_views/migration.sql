-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTrending" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT;

-- CreateTable
CREATE TABLE "BlogView" (
    "blogId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BlogView_pkey" PRIMARY KEY ("blogId","day")
);

-- CreateIndex
CREATE INDEX "Blog_isFeatured_idx" ON "Blog"("isFeatured");

-- CreateIndex
CREATE INDEX "BlogView_day_idx" ON "BlogView"("day");

-- AddForeignKey
ALTER TABLE "BlogView" ADD CONSTRAINT "BlogView_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
