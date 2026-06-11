// ─────────────────────────────────────────────────────────────────────────
// Destination : hooks/useTaskFormLogic.js (REMPLACE l'existant)
// ─────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useCreateTask } from "@/hooks/useCreateTask";

// Logique partagée du formulaire de création (PC et mobile) : le client
// n'envoie que les champs du schéma de création — ni difficulté ni XP,
// le serveur dérive tout de la priorité.
export function useTaskFormLogic(onSuccessCallback) {
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState("NONE");
    const [taskType, setTaskType] = useState("NONE");
    const [dueDate, setDueDate] = useState("");

    const createTaskMutation = useCreateTask();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || createTaskMutation.isPending) return;

        createTaskMutation.mutate(
            {
                title,
                priority,
                taskType,
                dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            },
            {
                onSuccess: () => {
                    setTitle("");
                    setPriority("NONE");
                    setTaskType("NONE");
                    setDueDate("");
                    if (onSuccessCallback) onSuccessCallback();
                },
            },
        );
    };

    return {
        title,
        setTitle,
        priority,
        setPriority,
        taskType,
        setTaskType,
        dueDate,
        setDueDate,
        handleSubmit,
        isPending: createTaskMutation.isPending,
        isError: createTaskMutation.isError,
        error: createTaskMutation.error,
    };
}
