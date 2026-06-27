"use client";

import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@/components/ui/icons";

export function PageHeader({ title, onBack }) {
    const router = useRouter();

    const handleBack = onBack ?? (() => router.back());

    return (
        <div className="mb-6 flex items-center gap-2">
            <button
                type="button"
                onClick={handleBack}
                aria-label="Retour"
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
                <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {title}
            </h1>
        </div>
    );
}
