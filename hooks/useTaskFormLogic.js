import { useState } from "react";
import { useCreateTask } from "@/hooks/useCreateTask";

export function useTaskFormLogic(onSuccessCallback) {
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState("NONE");
    const [taskType, setTaskType] = useState("NONE");
    const [dueDate, setDueDate] = useState("");
    const [tags, setTags] = useState([]);

    const createTaskMutation = useCreateTask();

    // Ajout idempotent : pas de doublon, on trim, on ignore le vide.
    const addTag = (name) => {
        const clean = name.trim();
        if (!clean || tags.includes(clean)) return;
        setTags((prev) => [...prev, clean]);
    };

    const removeTag = (name) => {
        setTags((prev) => prev.filter((t) => t !== name));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || createTaskMutation.isPending) return;

        createTaskMutation.mutate(
            {
                title,
                priority,
                taskType,
                dueDate: dueDate ? new Date(dueDate).toISOString() : null,
                tags,
            },
            {
                onSuccess: () => {
                    setTitle("");
                    setPriority("NONE");
                    setTaskType("NONE");
                    setDueDate("");
                    setTags([]);
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
        tags,
        addTag,
        removeTag,
        handleSubmit,
        isPending: createTaskMutation.isPending,
        isError: createTaskMutation.isError,
        error: createTaskMutation.error,
    };
}
