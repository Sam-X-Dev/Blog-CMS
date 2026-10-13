"use client";

import { useState } from "react";
import { BlogEditor } from "@/components/admin/editor/BlogEditor";
import { BlogContent } from "@/components/blog/BlogContent";

export default function EditorTestPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [content, setContent] = useState("");
    const [published, setPublished] = useState(false);

    // A fake "published blog page" so we can see the result before Samarth's pages exist
    if (published) {
        const words = content
            .replace(/<[^>]+>/g, " ")
            .split(/\s+/)
            .filter(Boolean).length;
        return (
            <div className="min-h-screen w-full bg-white dark:bg-zinc-950">
                <div className="sticky top-0 z-10 border-b border-zinc-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800">
                    Test preview of the public blog page ·{" "}
                    <button onClick={() => setPublished(false)} className="font-semibold underline">
                        Back to editor
                    </button>
                </div>

                <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
                    <p className="text-sm font-medium text-indigo-600">Technology</p>
                    <h1 className="mt-2 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
                        {title || "Untitled blog"}
                    </h1>
                    {description && <p className="mt-4 text-lg text-zinc-600">{description}</p>}
                    <p className="mt-6 border-b border-zinc-200 pb-6 text-sm text-zinc-500">
                        {new Date().toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}{" "}
                        · {Math.max(1, Math.ceil(words / 200))} min read
                    </p>

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
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-lg"
            />
            <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
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
                <details className="text-xs">
                    <summary className="cursor-pointer text-gray-500">
                        Saved HTML ({content.length} characters)
                    </summary>
                    <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 whitespace-pre-wrap">
                        {content}
                    </pre>
                </details>
                <button
                    onClick={() => setPublished(true)}
                    disabled={!content}
                    className="shrink-0 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-40"
                >
                    See as published blog
                </button>
            </div>
        </div>
    );
}