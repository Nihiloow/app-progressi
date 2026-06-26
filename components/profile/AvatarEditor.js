"use client";

import { useState } from "react";
import { AvatarRing } from "@/components/AvatarProgress";
import { AvatarUploadModal } from "@/components/profile/AvatarUploadModal";
import { EditIcon } from "@/components/ui/icons";

// Wrapper EXCLUSIF à la page Profil : ajoute une affordance d'édition
// autour d'AvatarRing, sans modifier AvatarRing lui-même.
//
// L'opacité et le fond du voile de survol sont en STYLE INLINE, pas en
// classes Tailwind conditionnelles : un style inline s'applique toujours,
// sans dépendre d'aucune étape de compilation/génération de classes — ça
// élimine toute incertitude sur "est-ce que Tailwind a bien généré cette
// classe" après que la version à groupes nommés (group/avatar-edit) n'a
// produit aucun effet visible en test réel, pour une cause non identifiée
// avec certitude. z-index explicite (40) pour garantir le voile au-dessus
// de tout élément interne d'AvatarRing (dont son tooltip, z-30).
export function AvatarEditor({ user }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    return (
        <div className="flex flex-col items-center">
            <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                aria-label="Changer la photo de profil"
                className="relative rounded-full outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
            >
                <AvatarRing user={user} />

                {/* Positionné pour couvrir exactement le cercle intérieur
                    (h-16 w-16, centré dans la zone h-24 w-24 d'AvatarRing)
                    — pas l'anneau XP autour, qui reste visible au survol. */}
                <div
                    style={{
                        opacity: isHovering ? 1 : 0,
                        backgroundColor: isHovering
                            ? "rgba(0, 0, 0, 0.5)"
                            : "transparent",
                        zIndex: 40,
                    }}
                    className="pointer-events-none absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-opacity duration-200"
                >
                    <EditIcon className="h-6 w-6 text-white" />
                </div>
            </button>

            <span className="mt-5 font-semibold text-slate-700 dark:text-slate-200">
                {user.pseudo}
            </span>

            <AvatarUploadModal
                user={user}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
