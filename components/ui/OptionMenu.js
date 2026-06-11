// Menu déroulant générique : remplace les blocs copiés-collés des menus
// type/priorité de TaskForm et MobileTaskForm. Le parent garde la main sur
// l'état d'ouverture (il gère plusieurs menus), le composant gère le rendu.

"use client";

export function OptionMenu({
    isOpen,
    onClose,
    onSelect,
    options,
    direction = "down", // "down" (PC, sous le bouton) ou "up" (mobile, au-dessus)
    align = "left",
    withOverlay = false, // mobile : un voile transparent capte le clic extérieur
}) {
    if (!isOpen) return null;

    const position = direction === "up" ? "bottom-full mb-2" : "top-full mt-2";
    const alignment = align === "right" ? "right-0" : "left-0";

    return (
        <>
            {withOverlay && (
                <div
                    className="fixed inset-0 z-[80] bg-transparent"
                    onClick={onClose}
                />
            )}
            <div
                className={`absolute ${position} ${alignment} z-[90] w-48 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-200 animate-in fade-in dark:bg-zinc-800 dark:ring-zinc-700`}
            >
                <div className="flex flex-col py-1">
                    {options.map((option) => {
                        const Icon = option.icon;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onSelect(option.value);
                                    onClose();
                                }}
                                className="flex items-center gap-3 px-4 py-3 text-left text-sm font-medium hover:bg-slate-50 dark:hover:bg-zinc-700/50"
                            >
                                <Icon
                                    className={`h-4 w-4 ${option.iconColor}`}
                                />
                                <span className="text-slate-700 dark:text-slate-200">
                                    {option.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
