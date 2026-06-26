"use client";

import { useState, useRef, useEffect } from "react";
import { useUploadAvatar } from "@/hooks/useUploadAvatar";
import { useRemoveAvatar } from "@/hooks/useRemoveAvatar";
import { CloseIcon, TrashIcon, CameraIcon } from "@/components/ui/icons";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 3 * 1024 * 1024;

// Modale de changement d'avatar, ouverte depuis AvatarEditor (page Profil
// uniquement). La validation client ici est un confort UX (retour immédiat
// avant même d'envoyer la requête) — elle ne remplace PAS la validation
// serveur (avatarUploadSchema), qui reste seule autorité Zero Trust : un
// client malveillant pourrait contourner ce contrôle côté navigateur.
export function AvatarUploadModal({ user, isOpen, onClose }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [clientError, setClientError] = useState("");
    const fileInputRef = useRef(null);

    const uploadAvatar = useUploadAvatar();
    const removeAvatar = useRemoveAvatar();

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    // Réinitialise la sélection à la fermeture, pour ne pas garder un
    // aperçu périmé d'une session précédente à la prochaine ouverture.
    useEffect(() => {
        if (!isOpen) {
            setSelectedFile(null);
            setPreviewUrl(null);
            setClientError("");
        }
    }, [isOpen]);

    // Libère l'URL objet créée pour l'aperçu — fuite mémoire sinon, le
    // navigateur ne révoque jamais ces URLs de lui-même.
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            setClientError(
                "Format non supporté (JPEG, PNG ou WebP uniquement).",
            );
            return;
        }
        if (file.size > MAX_SIZE_BYTES) {
            setClientError("L'image ne doit pas dépasser 3 Mo.");
            return;
        }

        setClientError("");
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSave = () => {
        if (!selectedFile) return;
        uploadAvatar.mutate(selectedFile, {
            onSuccess: () => onClose(),
        });
    };

    const handleRemove = () => {
        removeAvatar.mutate(undefined, {
            onSuccess: () => onClose(),
        });
    };

    const displayUrl = previewUrl ?? user.avatarUrl;
    const canSave = Boolean(selectedFile) && !uploadAvatar.isPending;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        Photo de profil
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fermer"
                        className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800"
                    >
                        <CloseIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="mb-4 flex justify-center">
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                        {displayUrl ? (
                            <img
                                src={displayUrl}
                                alt="Aperçu de l'avatar"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-3xl font-bold uppercase text-indigo-500">
                                {user.pseudo.charAt(0)}
                            </span>
                        )}
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                />

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-zinc-700 dark:text-slate-200 dark:hover:bg-zinc-800"
                >
                    <CameraIcon className="h-4 w-4" />
                    Choisir une image
                </button>

                {clientError && (
                    <p className="mt-2 text-xs text-red-500">{clientError}</p>
                )}
                {uploadAvatar.isError && (
                    <p className="mt-2 text-xs text-red-500">
                        {uploadAvatar.error.message}
                    </p>
                )}
                {removeAvatar.isError && (
                    <p className="mt-2 text-xs text-red-500">
                        {removeAvatar.error.message}
                    </p>
                )}

                <div className="mt-6 flex items-center justify-between gap-2">
                    {user.avatarUrl ? (
                        <button
                            type="button"
                            onClick={handleRemove}
                            disabled={removeAvatar.isPending}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-500/10"
                        >
                            <TrashIcon className="h-4 w-4" />
                            {removeAvatar.isPending
                                ? "Suppression…"
                                : "Supprimer"}
                        </button>
                    ) : (
                        <span />
                    )}

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!canSave}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
                            canSave
                                ? "bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                                : "cursor-not-allowed bg-slate-300 dark:bg-zinc-700"
                        }`}
                    >
                        {uploadAvatar.isPending ? "Envoi…" : "Enregistrer"}
                    </button>
                </div>
            </div>
        </div>
    );
}
