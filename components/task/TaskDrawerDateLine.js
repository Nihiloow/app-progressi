"use client";

import { useState } from "react";
import { CalendarIcon } from "@/components/ui/icons";
import { dueDateColor, formatShortDate } from "@/components/ui/taskAppearance";
import { DrawerPopover } from "@/components/task/DrawerPopover";
import { TaskDrawerDateField } from "@/components/task/TaskDrawerDateField";

// Ligne de date. Le calendrier s'ouvre en flux sous la ligne, même
// principe que les autres popovers du tiroir.
export function TaskDrawerDateLine({ dueDate, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const dateValue = dueDate ? dueDate.split("T")[0] : "";

    const handleChange = (val) => {
        onChange(val ? new Date(val).toISOString() : null);
    };

    return (
        <div>
            <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                aria-expanded={isOpen}
                className={`flex items-center gap-2 text-sm font-medium ${
                    dueDate
                        ? dueDateColor(dueDate)
                        : "text-slate-400 dark:text-zinc-500"
                }`}
            >
                <CalendarIcon className="h-4 w-4" />
                {dueDate ? formatShortDate(dueDate) : "Aucune date"}
            </button>

            <DrawerPopover isOpen={isOpen}>
                <TaskDrawerDateField
                    value={dateValue}
                    onChange={handleChange}
                />
            </DrawerPopover>
        </div>
    );
}
