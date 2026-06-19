import { useState } from "react";
import { useCreateTask } from "@/hooks/useCreateTask";
import { useTagList } from "@/hooks/useTagList";
import { todayAsDateInput } from "@/lib/date";

export function useTaskFormLogic(onSuccessCallback) {
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState("NONE");
    const [taskType, setTaskType] = useState("NONE");
    const [dueDate, setDueDate] = useState(todayAsDateInput);
    const { tags, setTags, addTag, removeTag } = useTagList();

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
                tags,
            },
            {
                onSuccess: () => {
                    setTitle("");
                    setPriority("NONE");
                    setTaskType("NONE");
                    setDueDate(todayAsDateInput());
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
