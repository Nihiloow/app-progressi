"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }) {
    // On utilise useState pour s'assurer que le QueryClient n'est instancié qu'une seule fois,
    // même si React décide de re-rendre ce composant.
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
