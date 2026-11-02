import type { Metadata } from "next";
import { NotFoundContent } from "@/components/public/NotFoundContent";
import PublicLayout from "./(public)/layout";

export const metadata: Metadata = {
    title: "Page not found | BlogCMS",
};

/**
 * Shown for any URL that doesn't exist (e.g. /categries).
 * Lives outside the (public) folder, so it adds the same header and footer itself.
 */
export default function NotFound() {
    return (
        <PublicLayout>
            <NotFoundContent />
        </PublicLayout>
    );
}