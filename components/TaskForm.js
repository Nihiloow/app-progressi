"use client";

import { useState } from "react";
import { useCreateTask } from "@/hooks/useCreateTask";

export default function TaskForm() {
    const [title, setTitle] = useState("");
    const [difficulty, setDifficulty] = useState(1);

    const createTaskMutation = useCreateTask();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        createTaskMutation.mutate(
            {
                title: title,
                difficulty: parseInt(difficulty),
            },
            {
                onSuccess: () => {
                    setTitle("");
                    setDifficulty(1);
                },
            },
        );
    };

    return (
        <div className="mb-6">
            <form
                onSubmit={handleSubmit}
                className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col md:flex-row gap-4 items-center shadow-sm dark:bg-zinc-900 dark:border-zinc-800"
            >
                <input
                    type="text"
                    placeholder="Nouvelle quête..."
                    className="flex-1 w-full p-3 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 dark:bg-zinc-950 dark:border-zinc-800 dark:text-slate-100 dark:placeholder-zinc-500"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={createTaskMutation.isPending}
                />

                <select
                    className="p-3 w-full md:w-auto border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:bg-zinc-950 dark:border-zinc-800 dark:text-slate-300"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    disabled={createTaskMutation.isPending}
                >
                    <option value={1}>Facile</option>
                    <option value={2}>Moyen</option>
                    <option value={3}>Difficile</option>
                </select>

                <button
                    type="submit"
                    disabled={createTaskMutation.isPending || !title.trim()}
                    className="w-full md:w-auto bg-indigo-500 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {createTaskMutation.isPending ? "Ajout..." : "Créer"}
                </button>
            </form>

            {createTaskMutation.isError && (
                <div className="mt-2 text-sm text-red-500 font-medium px-2">
                    {createTaskMutation.error.message}
                </div>
            )}
        </div>
    );
}
