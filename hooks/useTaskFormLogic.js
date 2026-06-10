import { useState } from "react";
import { useCreateTask } from "@/hooks/useCreateTask";

export function useTaskFormLogic(onSuccessCallback) {
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState("NONE");
    const [taskType, setTaskType] = useState("SHALLOW_WORK");
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
                difficulty: taskType === "DEEP_WORK" ? 3 : 1,
                dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            },
            {
                onSuccess: () => {
                    setTitle("");
                    setPriority("NONE");
                    setTaskType("SHALLOW_WORK");
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
