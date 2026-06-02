'use client';
import type { ReactNode } from 'react';
import styles from './WidgetShell.module.css';

interface WidgetShellProps {
    title: string;
    icon?: ReactNode;
    isLoading?: boolean;
    children?: ReactNode;
}

export function WidgetShell({ title, icon, isLoading, children }: WidgetShellProps) {
    if (isLoading) {
        return (
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <div className={styles.skeletonIcon} />
                    <div className={styles.skeletonTitle} />
                </div>
                <div className={styles.skeletonBody} />
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                {icon && <span className={styles.icon}>{icon}</span>}
                <h3 className={styles.title}>{title}</h3>
            </div>
            <div className={styles.content}>{children}</div>
        </div>
    );
}