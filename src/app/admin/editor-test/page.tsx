"use client";

import { useState } from "react";
import { BlogEditor } from "@/components/admin/editor/BlogEditor";
import { ImagePicker } from "@/components/admin/media/ImagePicker";
import { BlogThumbnail } from "@/components/public/BlogThumbnail";
import { BlogContent } from "@/components/blog/BlogContent";
import { useDraft } from "@/lib/use-draft";

export default function EditorTestPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [content, setContent] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [published, setPublished] = useState(false);

    // Keeps the work in this browser, so a refresh doesn't wipe it
    const { savedAt, clear } = useDraft(
        "blog-draft:editor-test",
        { title, description, thumbnail, content },
        (d) => {
            setTitle(d.title);
            setDescription(d.description);
            setThumbnail(d.thumbnail ?? "");
            setContent(d.content);
        },
    );

    // A fake "published blog page" so we can see the result before Samarth's pages exist
    if (published) {
        const words = content
            .replace(/<[^>]+>/g, " ")
            .split(/\s+/)
            .filter(Boolean).length;
        return (
            <div className="min-h-screen w-full bg-white">
                <div className="sticky top-0 z-10 border-b border-brand-200 bg-brand-100 px-4 py-2 text-center text-caption text-brand-900">
                    Test preview of the public blog page ·{" "}
                    <button onClick={() => setPublished(false)} className="font-semibold underline">
                        Back to editor
                    </button>
                </div>

                <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
                    <p className="text-small font-medium text-brand-600">Technology</p>
                    <h1 className="mt-2 text-display text-brand-900">
                        {title || "Untitled blog"}
                    </h1>
                    {description && <p className="mt-4 text-body text-brand-muted">{description}</p>}
                    <p className="mt-6 border-b border-brand-200 pb-6 text-small text-brand-muted">
                        {new Date().toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}{" "}
                        · {Math.max(1, Math.ceil(words / 200))} min read
                    </p>

                    {thumbnail && (
                        <BlogThumbnail
                            src={thumbnail}
                            title={title}
                            eager
                            sizes="(min-width: 768px) 768px, 100vw"
                            className="mt-8 aspect-[16/10] w-full rounded-xl"
                        />
                    )}

                    <BlogContent html={content} className="mt-8" />
                </article>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-6xl space-y-4 p-4 sm:p-8">
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full rounded-lg border border-brand-400 bg-white px-3 py-2 text-heading text-brand-900 placeholder:text-brand-muted"
            />
            <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className="w-full rounded-lg border border-brand-400 bg-white px-3 py-2 text-small text-brand-900 placeholder:text-brand-muted"
            />
            {/* Same field Samarth adds to the real blog form */}
            <ImagePicker value={thumbnail || null} onChange={(url) => setThumbnail(url ?? "")} />
            <BlogEditor
                value={content}
                onChange={setContent}
                onImport={({ title: t, description: d }) => {
                    // Only fill fields that are still empty
                    if (t) setTitle((prev) => prev || t);
                    if (d) setDescription((prev) => prev || d);
                }}
            />
            <div className="flex items-center justify-between gap-4">
                <p className="text-caption text-brand-muted" aria-live="polite">
                    {savedAt
                        ? `Draft saved on this device at ${new Date(savedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
                        : "Start typing: your draft is saved on this device automatically"}
                    {savedAt && (
                        <button
                            type="button"
                            onClick={() => {
                                clear();
                                setTitle("");
                                setDescription("");
                                setThumbnail("");
                                setContent("");
                            }}
                            className="ml-3 font-medium text-red-600 hover:underline"
                        >
                            Clear draft
                        </button>
                    )}
                </p>
            </div>
            <div className="flex items-center justify-between gap-4">
                <details className="text-caption">
                    <summary className="cursor-pointer text-brand-muted">
                        Saved HTML ({content.length} characters)
                    </summary>
                    <pre className="mt-2 overflow-auto rounded bg-brand-50 p-3 whitespace-pre-wrap text-brand-900">
                        {content}
                    </pre>
                </details>
                <button
                    onClick={() => setPublished(true)}
                    disabled={!content}
                    className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-small font-medium text-white hover:bg-brand-700 disabled:opacity-40"
                >
                    See as published blog
                </button>
            </div>
        </div>
    );
}