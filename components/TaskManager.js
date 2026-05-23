"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TaskManager({ initialTasks }) {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [difficulty, setDifficulty] = useState("1");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Ajouter une nouvelle quête
    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsSubmitting(true);
        await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, difficulty }),
        });

        setTitle("");
        setIsSubmitting(false);
        router.refresh(); // Rafraîchit le serveur pour afficher la nouvelle tâche et l'XP
    };

    // 2. Valider une quête et gagner l'XP
    const handleComplete = async (taskId) => {
        const res = await fetch(`/api/tasks/${taskId}/complete`, {
            method: "PUT",
        });

        if (res.ok) {
            const data = await res.json();

            // Animation / Notification de Level Up type RPG
            if (data.hasLeveledUp) {
                alert(
                    `🎉 LEVEL UP ! Tu es passé niveau ${data.user.level} ! La difficulté augmente...`,
                );
            }

            router.refresh();
        }
    };

    // 3. Abandonner (supprimer) une quête
    const handleDelete = async (taskId) => {
        await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
        router.refresh();
    };

    return (
        <div className="space-y-8">
            {/* FORMULAIRE D'AJOUT (TaskForm) */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-bold text-white">
                    Ajouter une nouvelle quête
                </h2>
                <form
                    onSubmit={handleAddTask}
                    className="flex flex-col gap-4 md:flex-row"
                >
                    <input
                        type="text"
                        placeholder="Ex: Terminer la maquette Figma..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="flex-1 rounded-lg border border-slate-700 bg-slate-950 p-3 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                    />
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="1">Rang E (Facile - 50 XP)</option>
                        <option value="2">Rang C (Moyen - 100 XP)</option>
                        <option value="3">Rang S (Difficile - 150 XP)</option>
                    </select>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
                    >
                        {isSubmitting ? "..." : "Forger"}
                    </button>
                </form>
            </section>

            {/* LISTE DES QUÊTES (TaskList) */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-bold text-white">
                    Quêtes en cours
                </h2>

                {initialTasks.length === 0 ? (
                    <p className="text-center text-slate-500">
                        Ton journal de quêtes est vide. Repose-toi bien.
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {initialTasks.map((task) => (
                            <li
                                key={task.id}
                                className={`flex items-center justify-between rounded-lg border p-4 transition-all ${
                                    task.isCompleted
                                        ? "border-green-900/30 bg-green-900/10 opacity-50 grayscale"
                                        : "border-slate-800 bg-slate-950 hover:border-slate-700"
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() =>
                                            !task.isCompleted &&
                                            handleComplete(task.id)
                                        }
                                        disabled={task.isCompleted}
                                        className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                                            task.isCompleted
                                                ? "border-green-500 bg-green-500 text-slate-950"
                                                : "border-slate-500 hover:border-blue-400"
                                        }`}
                                    >
                                        {task.isCompleted && "✓"}
                                    </button>
                                    <div>
                                        <p
                                            className={`font-medium ${task.isCompleted ? "line-through text-slate-500" : "text-white"}`}
                                        >
                                            {task.title}
                                        </p>
                                        <span className="text-xs font-bold text-slate-500">
                                            {task.difficulty === 1
                                                ? "RANG E"
                                                : task.difficulty === 2
                                                  ? "RANG C"
                                                  : "RANG S"}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(task.id)}
                                    className="text-slate-500 hover:text-red-400 transition-colors"
                                    title="Abandonner la quête"
                                >
                                    ✕
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
