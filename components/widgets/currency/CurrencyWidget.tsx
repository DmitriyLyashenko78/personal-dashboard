'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WidgetShell } from '@/components/ui/WidgetShell';
import { ArrowDownUp, ChevronDown, AlertCircle } from 'lucide-react';
import styles from './CurrencyWidget.module.css';

const CURRENCIES = ['USD', 'EUR', 'RUB', 'BYN', 'GBP', 'CNY'] as const;
type Currency = (typeof CURRENCIES)[number];

interface CurrencyResponse {
    base: Currency;
    date: string;
    rates: Record<string, number>;
}

export function CurrencyWidget() {
    const [base, setBase] = useState<Currency>('EUR');

    const { data, isLoading, error } = useQuery<CurrencyResponse>({
        queryKey: ['currency', base],
        queryFn: async () => {
            const res = await fetch(`/api/currency?base=${base}`);
            if (!res.ok) throw new Error('Network error');
            return res.json();
        },
    });

    return (
        <WidgetShell title="Курсы валют" icon={<ArrowDownUp />}>
            <div className={styles.header}>
                <span className={styles.label}>Базовая валюта:</span>
                <div className={styles.selectWrapper}>
                    <select
                        value={base}
                        onChange={(e) => setBase(e.target.value as Currency)}
                        className={styles.select}
                        aria-label="Выбор базовой валюты"
                    >
                        {CURRENCIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <ChevronDown size={16} className={styles.chevron} />
                </div>
            </div>

            {isLoading ? (
                <div className={styles.state}>
                    <span className={styles.spin}>⟳</span>
                    Загрузка курсов...
                </div>
            ) : error ? (
                <div className={`${styles.state} ${styles.stateError}`}>
                    <AlertCircle size={18} />
                    Ошибка загрузки данных
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