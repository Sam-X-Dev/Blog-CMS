/**
 * Creates the admin account (or resets its password if the email already exists).
 *
 *   npm run db:create-admin -- --email you@example.com --password "a-strong-password" --name "Abhishek"
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

function arg(name: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

const email = arg("email")?.trim().toLowerCase();
const password = arg("password");
const name = arg("name")?.trim() || "Admin";

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Give a valid email: --email you@example.com");
  process.exit(1);
}
if (!password || password.length < 8) {
  console.error('Give a password of at least 8 characters: --password "..."');
  process.exit(1);
}

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL or DIRECT_URL is missing in .env");
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

async function main() {
  const hash = await bcrypt.hash(password!, 12);
  const admin = await prisma.admin.upsert({
    where: { email: email! },
    update: { password: hash, name },
    create: { email: email!, password: hash, name },
  });
  console.log(`Admin ready: ${admin.email}. Log in at /admin/login`);
}

main()
  .catch((e) => {
    console.error("Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
