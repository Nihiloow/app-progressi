"use client";

import TaskItem from "@/components/TaskItem";

export default function TaskList({ tasks, selectedTaskId, onSelectTask }) {
    if (!tasks || tasks.length === 0) {
        return (
            <p className="mt-10 text-center text-sm text-slate-400">
                Tu n'as visiblement rien à faire aujourd'hui...
            </p>
        );
    }

    return (
        <div className="space-y-3">
            {tasks.map((task) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    isSelected={task.id === selectedTaskId}
                    onSelect={onSelectTask}
                />
            ))}
        </div>
    );
}
