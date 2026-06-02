'use client';
import { useQuery } from '@tanstack/react-query';
import { WidgetShell } from '@/components/ui/WidgetShell';
import { ArrowDownUp, Loader2, AlertCircle } from 'lucide-react';
import styles from './CurrencyWidget.module.css';

type CurrencyResponse = { base: string; date: string; rates: Record<string, number> };

export function CurrencyWidget() {
    const { data, isLoading, error } = useQuery<CurrencyResponse>({
        queryKey: ['currency', 'EUR'],
        queryFn: async () => {
            const res = await fetch('/api/currency?base=EUR&symbols=USD,GBP,RUB');
            if (!res.ok) throw new Error('Network error');
            return res.json();
        },
    });

    if (isLoading) {
        return <WidgetShell title="Курсы валют" icon={<ArrowDownUp />} />;
    }

    return (
        <WidgetShell title="Курсы валют" icon={<ArrowDownUp />}>
            {error ? (
                <div className={styles.state}>
                    <AlertCircle size={18} />
                    <span>Ошибка загрузки данных</span>
                </div>
            ) : (
                <ul className={styles.list}>
                    {Object.entries(data?.rates || {}).map(([code, rate]) => (
                        <li key={code} className={styles.item}>
                            <span className={styles.code}>{code}</span>
                            <span className={styles.rate}>{rate.toFixed(4)}</span>
                        </li>
                    ))}
                </ul>
            )}
        </WidgetShell>
    );
}