'use client';

import { useSyncExternalStore } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from './Header.module.css';

// ── Кэш времени ──────────────────────────────────────────────
let currentTime: Date | null = null;

function subscribe(callback: () => void) {
    currentTime = new Date();
    const timerId = setInterval(() => {
        currentTime = new Date();
        callback();
    }, 1000);
    return () => clearInterval(timerId);
}

function getSnapshot() {
    return currentTime;
}

function getServerSnapshot() {
    return null;
}

// ── Компонент ────────────────────────────────────────────────
export default function Header() {
    const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    return (
        <header className={styles.header}>
            <div className="container">
                <div className={styles.headerContent}>
                    <div className={styles.logo}>
                        <span className={styles.bracket}>[</span>
                        <span className={styles.letters}>DL</span>
                        <span className={styles.bracket}>]</span>
                    </div>
                    <div className={styles.clock}>
                        <div className={styles.timeRow}>
                            <span className={styles.timeLabel}>Местное время</span>
                            <time className={styles.time}>
                                {now ? format(now, 'HH:mm:ss') : '--:--:--'}
                            </time>
                        </div>
                        <span className={styles.date}>
                            {now ? format(now, 'd MMMM yyyy, EEEE', { locale: ru }) : ''}
                            </span>
                    </div>
                </div>
            </div>
        </header>
    );
}