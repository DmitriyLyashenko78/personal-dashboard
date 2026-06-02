'use client';

import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                queryCache: new QueryCache({
                    onError: (error) => {
                        console.warn('[RQ Global] Ошибка запроса:', error);
                        // Здесь позже подключите toast-уведомления или Sentry
                    },
                }),
                defaultOptions: {
                    queries: {
                        staleTime: 5 * 60 * 1000,
                        retry: 2,
                        retryDelay: (attemptIndex) =>
                            Math.min(1000 * 2 ** attemptIndex, 30000),
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}