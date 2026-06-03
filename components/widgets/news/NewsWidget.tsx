'use client';
import { useQuery } from '@tanstack/react-query';
import { WidgetShell } from '@/components/ui/WidgetShell';
import { Rss, ExternalLink, User, Calendar, AlertCircle } from 'lucide-react';
import styles from './NewsWidget.module.css';

interface NewsItem {
    id: string;
    title: string;
    url: string;
    domain: string;
    author: string;
    date: string;
}

export function NewsWidget() {
    const { data, isLoading, error } = useQuery<NewsItem[]>({
        queryKey: ['news'],
        queryFn: async () => {
            const res = await fetch('/api/news');
            if (!res.ok) throw new Error('Failed to fetch news');
            return res.json();
        },
    });

    let content: React.ReactNode;

    if (error) {
        content = (
            <div className={styles.state}>
                <AlertCircle size={18} />
                <span>Ошибка загрузки новостей</span>
            </div>
        );
    } else {
        content = (
            <ul className={styles.list}>
                {data?.map((item, i) => (
                    <li key={item.id} className={styles.item}>
                        <div className={styles.header}>
                            <span className={styles.rank}>#{i + 1}</span>
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.title}>
                                {item.title}
                                <ExternalLink size={12} className={styles.external} />
                            </a>
                        </div>
                        <div className={styles.meta}>
                            <span className={styles.author}>
                                <User size={12} />
                                {item.author}
                            </span>
                            <span className={styles.divider}>•</span>
                            <span className={styles.time}>
                                <Calendar size={12} />
                                {item.date}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <WidgetShell title="IT-новости (RU)" icon={<Rss />} isLoading={isLoading}>
            {content}
        </WidgetShell>
    );
}