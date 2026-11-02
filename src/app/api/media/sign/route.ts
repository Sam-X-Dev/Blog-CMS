import { fail, ok } from "@/lib/api-response";
import { createUploadSignature } from "@/lib/cloudinary";

// POST /api/media/sign — admin only (protect in proxy.ts)
// Gives the browser a one-time signature so it can upload straight to Cloudinary.
// The file never passes through our server, so there is no server upload size limit.
export async function POST() {
  const signature = createUploadSignature();
  if (!signature) {
    return fail(
      "Image upload isn't set up yet. Add the Cloudinary keys to .env and restart the server.",
      503,
    );
  }
  return ok(signature, "Upload signature created");
}
