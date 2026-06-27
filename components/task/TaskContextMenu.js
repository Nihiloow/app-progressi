"use client";

import { useState, useRef, useEffect } from "react";
import {
    getPriorityConfig,
    getTypeConfig,
    PRIORITY_OPTIONS,
    TYPE_OPTIONS,
} from "@/components/ui/taskAppearance";
import {
    LightningIcon,
    CalendarIcon,
    TagIcon,
    ChevronRightIcon,
    BanIcon,
    TrashIcon,
} from "@/components/ui/icons";
import { OptionMenu } from "@/components/ui/OptionMenu";
import { TagPanel } from "@/components/ui/TagPanel";
import { DatePicker } from "@/components/ui/DatePicker";

// Menu contextuel façon TickTick : priorité, type, date, tags, actions.
// Positionné à la souris (desktop) ou centré sous la tâche (mobile, via
// le longpress géré par TaskItem qui fournit `position`).
export function TaskContextMenu({
    task,
    position,
    onClose,
    onUpdateTask,
    onToggleStatus,
    onDeleteTask,
}) {
    const menuRef = useRef(null);
    const [subMenu, setSubMenu] = useState(null); // "priority" | "type" | "tags" | null
    // Timer partagé : onMouseLeave démarre la fermeture du sous-menu avec un
    // délai de 120ms. Si la souris entre dans l'OptionMenu avant l'expiration,
    // onMouseEnter l'annule — la souris peut traverser le micro-espace entre
    // le bouton et le panneau sans que rien ne se ferme.
    const closeTimer = useRef(null);

    const scheduleClose = () => {
        closeTimer.current = setTimeout(() => setSubMenu(null), 120);
    };
    const cancelClose = () => clearTimeout(closeTimer.current);

    // Nettoyage au démontage
    useEffect(() => () => clearTimeout(closeTimer.current), []);

    // Fermeture au clic extérieur
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        const id = setTimeout(
            () => document.addEventListener("pointerdown", handler),
            10,
        );
        return () => {
            clearTimeout(id);
            document.removeEventListener("pointerdown", handler);
        };
    }, [onClose]);

    // Fermeture sur Échap : ferme le sous-menu s'il est ouvert, sinon ferme
    // le menu entier. Permet de revenir au sous-menu sans tout perdre.
    useEffect(() => {
        const handler = (e) => {
            if (e.key !== "Escape") return;
            if (subMenu) {
                setSubMenu(null);
            } else {
                onClose();
            }
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [subMenu, onClose]);

    const style = {
        position: "fixed",
        top: position.y,
        left: position.x,
        zIndex: 200,
    };

    const isAbandoned = task.status === "WONT_DO";

    const handlePriority = (value) => {
        onUpdateTask({ priority: value });
        onClose();
    };

    const handleType = (value) => {
        onUpdateTask({ taskType: value });
        onClose();
    };

    const handleWontDo = () => {
        const next = isAbandoned ? "TODO" : "WONT_DO";
        onToggleStatus(next);
        onClose();
    };

    // Entrée commune à chaque ligne avec sous-menu : ouvre immédiatement,
    // annule tout timer de fermeture en cours.
    const handleRowEnter = (name) => {
        cancelClose();
        setSubMenu(name);
    };

    return (
        <div
            ref={menuRef}
            role="menu"
            aria-label="Options de la tâche"
            style={style}
            // PAS de overflow-hidden ici : un sous-menu (OptionMenu, TagPanel)
            // s'ouvre en position absolute à droite via left-full, donc hors
            // de la boîte de ce conteneur — overflow-hidden le rognerait
            // entièrement (bug constaté : sous-menu invisible bien que monté
            // dans le DOM). L'arrondi des coins est géré directement sur le
            // premier et le dernier item interactif (rounded-t-lg / rounded-b-lg)
            // pour éviter que leur survol dépasse visuellement du conteneur.
            className="min-w-[220px] rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
        >
            {/* Priorité */}
            <div
                className="relative"
                onMouseEnter={() => handleRowEnter("priority")}
                onMouseLeave={scheduleClose}
            >
                <button
                    type="button"
                    role="menuitem"
                    aria-haspopup="true"
                    aria-expanded={subMenu === "priority"}
                    onFocus={() => handleRowEnter("priority")}
                    className="flex w-full items-center gap-3 rounded-t-lg px-4 py-2.5 text-sm text-slate-700 outline-none transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 dark:text-slate-200 dark:hover:bg-zinc-800 dark:focus-visible:bg-zinc-800"
                >
                    <LightningIcon
                        className={`h-4 w-4 ${getPriorityConfig(task.priority).color}`}
                    />
                    Priorité
                    <ChevronRightIcon className="ml-auto h-3.5 w-3.5 text-slate-400" />
                </button>
                {/* onMouseEnter sur l'OptionMenu annule le timer de fermeture :
                    la souris peut glisser du bouton au panneau sans interruption. */}
                <div onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
                    <OptionMenu
                        isOpen={subMenu === "priority"}
                        onClose={() => setSubMenu(null)}
                        onSelect={handlePriority}
                        options={PRIORITY_OPTIONS}
                        direction="right"
                    />
                </div>
            </div>

            {/* Type */}
            <div
                className="relative"
                onMouseEnter={() => handleRowEnter("type")}
                onMouseLeave={scheduleClose}
            >
                <button
                    type="button"
                    role="menuitem"
                    aria-haspopup="true"
                    aria-expanded={subMenu === "type"}
                    onFocus={() => handleRowEnter("type")}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 outline-none transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 dark:text-slate-200 dark:hover:bg-zinc-800 dark:focus-visible:bg-zinc-800"
                >
                    {(() => {
                        const cfg = getTypeConfig(task.taskType);
                        const Icon = cfg.icon;
                        return <Icon className={`h-4 w-4 ${cfg.color}`} />;
                    })()}
                    Type
                    <ChevronRightIcon className="ml-auto h-3.5 w-3.5 text-slate-400" />
                </button>
                <div onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
                    <OptionMenu
                        isOpen={subMenu === "type"}
                        onClose={() => setSubMenu(null)}
                        onSelect={handleType}
                        options={TYPE_OPTIONS}
                        direction="right"
                    />
                </div>
            </div>

            {/* Tags */}
            <div
                className="relative"
                onMouseEnter={() => handleRowEnter("tags")}
                onMouseLeave={scheduleClose}
            >
                <button
                    type="button"
                    role="menuitem"
                    aria-haspopup="true"
                    aria-expanded={subMenu === "tags"}
                    onFocus={() => handleRowEnter("tags")}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 outline-none transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 dark:text-slate-200 dark:hover:bg-zinc-800 dark:focus-visible:bg-zinc-800"
                >
                    <TagIcon className="h-4 w-4 text-slate-500" />
                    Étiquettes
                    <ChevronRightIcon className="ml-auto h-3.5 w-3.5 text-slate-400" />
                </button>
                <div onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
                    <TagPanel
                        isOpen={subMenu === "tags"}
                        tags={task.tags?.map((t) => t.name) ?? []}
                        onAdd={(name) => {
                            const current = task.tags?.map((t) => t.name) ?? [];
                            if (!current.includes(name)) {
                                onUpdateTask({ tags: [...current, name] });
                            }
                        }}
                        onRemove={(name) => {
                            const updated = (
                                task.tags?.map((t) => t.name) ?? []
                            ).filter((n) => n !== name);
                            onUpdateTask({ tags: updated });
                        }}
                        direction="right"
                    />
                </div>
            </div>

            {/* Date — DatePicker inline dans le menu contextuel */}
            <div className="flex items-center gap-3 px-4 py-2.5">
                <CalendarIcon className="h-4 w-4 flex-shrink-0 text-slate-500" />
                <span className="text-sm text-slate-700 dark:text-slate-200">
                    Date
                </span>
                <div className="ml-auto">
                    <DatePicker
                        value={task.dueDate ? task.dueDate.split("T")[0] : ""}
                        onChange={(val) =>
                            onUpdateTask({
                                dueDate: val
                                    ? new Date(val).toISOString()
                                    : null,
                            })
                        }
                        align="right"
                        direction="up"
                    />
                </div>
            </div>

            <div className="my-1 border-t border-slate-100 dark:border-zinc-800" />

            {/* Ne fera pas / Réactiver */}
            <button
                type="button"
                role="menuitem"
                onClick={handleWontDo}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm outline-none transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 dark:hover:bg-zinc-800 dark:focus-visible:bg-zinc-800"
            >
                <BanIcon className="h-4 w-4 text-slate-500" />
                <span
                    className={
                        isAbandoned
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-slate-700 dark:text-slate-200"
                    }
                >
                    {isAbandoned ? "Réactiver la tâche" : "Ne fera pas"}
                </span>
            </button>

            <div className="my-1 border-t border-slate-100 dark:border-zinc-800" />

            {/* Supprimer — destructif, rouge pour signal visuel clair */}
            <button
                type="button"
                role="menuitem"
                onClick={() => {
                    onDeleteTask();
                    onClose();
                }}
                className="flex w-full items-center gap-3 rounded-b-lg px-4 py-2.5 text-sm text-red-500 outline-none transition-colors hover:bg-red-50 focus-visible:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 dark:focus-visible:bg-red-500/10"
            >
                <TrashIcon className="h-4 w-4" />
                Supprimer la tâche
            </button>
        </div>
    );
}
