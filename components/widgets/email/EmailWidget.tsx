'use client';
import { useQuery } from '@tanstack/react-query';
import { WidgetShell } from '@/components/ui/WidgetShell';
import { Mail, Clock, AlertCircle, Loader2 } from 'lucide-react';
import styles from './EmailWidget.module.css';

interface EmailItem {
    id: string;
    from: string;
    subject: string;
    date: string;
    unread: boolean;
}

export function EmailWidget() {
    const { data, isLoading, error } = useQuery<EmailItem[]>({
        queryKey: ['emails'],
        queryFn: async () => {
            const res = await fetch('/api/email');
            if (!res.ok) throw new Error('Failed to fetch emails');
            return res.json();
        },
        staleTime: 2 * 60 * 1000, // Обновляем каждые 2 минуты
    });

    if (isLoading) {
        return <WidgetShell title="Яндекс Почта" icon={<Mail />} isLoading />;
    }

    if (error) {
        return (
            <WidgetShell title="Яндекс Почта" icon={<Mail />}>
                <div className={styles.state}>
                    <AlertCircle size={18} />
                    <span>Ошибка подключения к почте</span>
                </div>
            </WidgetShell>
        );
    }

    if (!data?.length) {
        return (
            <WidgetShell title="Яндекс Почта" icon={<Mail />}>
                <div className={styles.empty}>Входящие пусты</div>
            </WidgetShell>
        );
    }

    return (
        <WidgetShell title="Яндекс Почта" icon={<Mail />}>
            <ul className={styles.list}>
                {data.map((email) => (
                    <li key={email.id} className={`${styles.item} ${email.unread ? styles.unread : ''}`}>
                        <div className={styles.main}>
                            <span className={styles.from}>{email.from}</span>
                            <span className={styles.subject}>{email.subject}</span>
                        </div>
                        <div className={styles.side}>
                            <Clock size={12} />
                            <span className={styles.time}>{email.date}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </WidgetShell>
    );
}