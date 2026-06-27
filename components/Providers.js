"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { XpToastProvider } from "@/components/feedback/XpToastProvider";
import { XpToast } from "@/components/feedback/XpToast";
import { PomodoroTimerProvider } from "@/components/pomodoro/PomodoroTimerProvider";

export default function Providers({ children }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <XpToastProvider>
                <PomodoroTimerProvider>
                    {children}
                    <XpToast />
                </PomodoroTimerProvider>
            </XpToastProvider>
        </QueryClientProvider>
    );
}
