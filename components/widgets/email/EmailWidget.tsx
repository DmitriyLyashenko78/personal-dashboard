'use client';
import { useQuery } from '@tanstack/react-query';
import { WidgetShell } from '@/components/ui/WidgetShell';
import { Mail, Clock, AlertCircle } from 'lucide-react';
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
        staleTime: 2 * 60 * 1000,
    });

    let content: React.ReactNode;

    if (isLoading) {
        content = null;
    } else if (error) {
        content = (
            <div className={styles.state}>
                <AlertCircle size={18} />
                <span>Ошибка подключения к почте</span>
            </div>
        );
    } else if (!data?.length) {
        content = <div className={styles.empty}>Входящие пусты</div>;
    } else {
        content = (
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
        );
    }

    return (
        <WidgetShell title="Яндекс Почта" icon={<Mail />} isLoading={isLoading}>
            {content}
        </WidgetShell>
    );
}