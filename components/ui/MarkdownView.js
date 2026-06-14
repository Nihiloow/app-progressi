"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

// Rendu Markdown SÛR, partagé entre la lecture (TaskDetails) et l'aperçu de
// la modale. react-markdown bâtit un arbre React (jamais de
// dangerouslySetInnerHTML) ; rehype-sanitize neutralise ce qui reste
// dangereux (URLs javascript:, balises interdites). rehype-raw est
// VOLONTAIREMENT absent : le HTML brut tapé dans le markdown est ignoré,
// pas exécuté. Zero Trust au rendu.
export function MarkdownView({ source }) {
    if (!source?.trim()) return null;

    return (
        <div className="prose prose-sm prose-slate max-w-none dark:prose-invert">
            <Markdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
            >
                {source}
            </Markdown>
        </div>
    );
}
