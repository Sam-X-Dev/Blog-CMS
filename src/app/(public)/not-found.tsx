import { NotFoundContent } from "@/components/public/NotFoundContent";

/** Shown when a public page calls notFound(), e.g. /categories/does-not-exist. Header and footer come from the layout. */
export default function PublicNotFound() {
    return <NotFoundContent />;
}