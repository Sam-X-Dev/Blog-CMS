import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { slugify } from "@/lib/slugify";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL or DIRECT_URL environment variable is missing.");
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const INITIAL_CATEGORIES = [
  "Technology",
  "Programming",
  "Web Development",
  "Cloud",
  "DevOps",
  "Cybersecurity",
  "Career",
];

async function main() {
  console.log("Seeding categories...");

  for (const name of INITIAL_CATEGORIES) {
    const slug = slugify(name);
    await prisma.category.upsert({
      where: { slug },
      update: { name },
      create: {
        name,
        slug,
      },
    });
  }

  console.log(`Successfully seeded ${INITIAL_CATEGORIES.length} categories.`);

  // TODO (Samarth): Seed the admin user and sample blogs here.
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
