import Form from "next/form";
import { Search } from "lucide-react";

/** Small search box in the header. Sends you to /blogs?q=your+words */
export function HeaderSearch({ id, className = "" }: { id: string; className?: string }) {
  return (
    <Form
      action="/blogs"
      role="search"
      className={`border-brand-400 focus-within:ring-brand-400 flex h-10 items-center gap-2 rounded-lg border bg-white px-3 focus-within:ring-2 ${className}`}
    >
      <Search className="text-brand-400 size-4 shrink-0" aria-hidden />
      <label htmlFor={id} className="sr-only">
        Search blogs
      </label>
      <input
        id={id}
        name="q"
        type="search"
        placeholder="Search blogs..."
        className="text-brand-900 placeholder:text-brand-muted text-small w-full bg-transparent outline-none"
      />
    </Form>
  );
}
