"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { XpToastProvider } from "@/components/feedback/XpToastProvider";
import { XpToast } from "@/components/feedback/XpToast";

export default function Providers({ children }) {
    // On utilise useState pour s'assurer que le QueryClient n'est instancié qu'une seule fois,
    // même si React décide de re-rendre ce composant.
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <XpToastProvider>
                {children}
                <XpToast />
            </XpToastProvider>
        </QueryClientProvider>
    );
}
