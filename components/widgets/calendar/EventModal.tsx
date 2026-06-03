'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { CalendarEvent } from '@/lib/store/calendarStore';
import styles from './CalendarWidget.module.css';

type EventModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
    initialData: CalendarEvent | null;
};

const COLORS = ['blue', 'green', 'red', 'purple', 'orange'] as const;

export function EventModal({ isOpen, onClose, onSave, initialData }: EventModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [location, setLocation] = useState('');
    const [color, setColor] = useState<CalendarEvent['color']>('blue');

    const fillForm = (data: CalendarEvent | null) => {
        if (data && data.id) {
            setTitle(data.title);
            setDescription(data.description || '');
            setSelectedDate(format(new Date(data.startTime), 'yyyy-MM-dd'));
            setStartTime(data.startTime.slice(11, 16));
            setEndTime(data.endTime?.slice(11, 16) || '');
            setLocation(data.location || '');
            setColor(data.color || 'blue');
        } else {
            const today = format(new Date(), 'yyyy-MM-dd');
            const now = new Date();
            const nextHour = new Date(now);
            nextHour.setHours(now.getHours() + 1, 0, 0, 0);
            const endHour = new Date(nextHour);
            endHour.setHours(endHour.getHours() + 1);
            setTitle('');
            setDescription('');
            setLocation('');
            setColor('blue');
            setSelectedDate(today);
            setStartTime(format(nextHour, 'HH:mm'));
            setEndTime(format(endHour, 'HH:mm'));
        }
    };

    useEffect(() => {
        if (isOpen) {
            fillForm(initialData);
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) return;

        const [year, month, day] = selectedDate.split('-').map(Number);
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);

        const startISO = new Date(year, month - 1, day, startH, startM || 0).toISOString();

        let endISO: string | undefined;
        if (endTime) {
            endISO = new Date(year, month - 1, day, endH, endM || 0).toISOString();
            if (new Date(endISO) < new Date(startISO)) {
                const endDate = new Date(endISO);
                endDate.setDate(endDate.getDate() + 1);
                endISO = endDate.toISOString();
            }
        }

        const eventData = {
            title: title.trim(),
            description: description.trim() || undefined,
            startTime: startISO,
            endTime: endISO,
            location: location.trim() || undefined,
            color,
        };

        onSave(eventData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>
                        {initialData?.id ? 'Редактировать событие' : 'Новое событие'}
                    </h3>
                    <button className={styles.iconButton} onClick={onClose} aria-label="Закрыть">
                        <X size={18} />
                    </button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Название *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Встреча, дедлайн..."
                            required
                            maxLength={100}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Описание</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Детали события..."
                            maxLength={300}
                            rows={3}
                        />
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Дата *</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Начало *</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Окончание</label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Место</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Zoom, офис..."
                                maxLength={80}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Цвет</label>
                        <div className={styles.colorPicker}>
                            {COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`${styles.colorOption} ${styles[c as keyof typeof styles]} ${color === c ? styles.selected : ''}`}
                                    onClick={() => setColor(c)}
                                    aria-label={`Цвет ${c}`}
                                    title={c}
                                />
                            ))}
                        </div>
                    </div>

                    <div className={styles.modalActions}>
                        <button
                            type="button"
                            className={`${styles.modalButton} ${styles.secondary}`}
                            onClick={onClose}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className={`${styles.modalButton} ${styles.primary}`}
                        >
                            {initialData?.id ? 'Сохранить' : 'Добавить'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}