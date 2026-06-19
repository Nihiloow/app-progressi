import { useState } from "react";
import { useCreateTask } from "@/hooks/useCreateTask";
import { useTagList } from "@/hooks/useTagList";

// Renvoie "YYYY-MM-DD" en heure locale — utilisé comme valeur par défaut
// du champ date. Calculé à chaque appel (montage du formulaire) et non
// au niveau module, pour que la date soit juste si l'onglet reste ouvert
// au-delà de minuit.
const todayAsDateInput = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

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
