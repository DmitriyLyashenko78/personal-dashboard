'use client';

import { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    addMonths,
    subMonths,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarEvent } from '@/lib/store/calendarStore';
import styles from './CalendarMonthModal.module.css';

interface CalendarMonthModalProps {
    isOpen: boolean;
    onClose: () => void;
    events: CalendarEvent[];
    onSelectDate: (date: Date) => void;
    initialMonth?: Date;
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// Проверяет, есть ли события в этот день
function hasEventOnDay(day: Date, events: CalendarEvent[]): boolean {
    return events.some((ev) => {
        const eventDate = new Date(ev.startTime);
        return isSameDay(eventDate, day);
    });
}

export function CalendarMonthModal({
                                       isOpen,
                                       onClose,
                                       events,
                                       onSelectDate,
                                       initialMonth,
                                   }: CalendarMonthModalProps) {
    const [displayMonth, setDisplayMonth] = useState<Date>(
        initialMonth || new Date()
    );

    if (!isOpen) return null;

    const monthStart = startOfMonth(displayMonth);
    const monthEnd = endOfMonth(displayMonth);
    // Начинаем с понедельника
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const handlePreviousMonth = () => setDisplayMonth((d) => subMonths(d, 1));
    const handleNextMonth = () => setDisplayMonth((d) => addMonths(d, 1));
    const handleToday = () => setDisplayMonth(new Date());

    const handleDayClick = (day: Date) => {
        onSelectDate(day);
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3 className={styles.title}>
                        {format(displayMonth, 'LLLL yyyy', { locale: ru })}
                    </h3>
                    <button className={styles.iconButton} onClick={onClose} aria-label="Закрыть">
                        <X size={18} />
                    </button>
                </div>

                <div className={styles.nav}>
                    <button className={styles.navButton} onClick={handlePreviousMonth} aria-label="Предыдущий месяц">
                        <ChevronLeft size={16} />
                    </button>
                    <button className={styles.todayButton} onClick={handleToday}>
                        Сегодня
                    </button>
                    <button className={styles.navButton} onClick={handleNextMonth} aria-label="Следующий месяц">
                        <ChevronRight size={16} />
                    </button>
                </div>

                <div className={styles.grid}>
                    {WEEKDAYS.map((d) => (
                        <div key={d} className={styles.weekday}>
                            {d}
                        </div>
                    ))}

                    {calendarDays.map((day) => {
                        const currentMonth = isSameMonth(day, displayMonth);
                        const today = isToday(day);
                        const hasEvent = hasEventOnDay(day, events);

                        let className = styles.day;
                        if (!currentMonth) className += ' ' + styles.otherMonth;
                        if (today) className += ' ' + styles.today;
                        if (hasEvent) className += ' ' + styles.hasEvent;

                        return (
                            <button
                                key={day.toISOString()}
                                type="button"
                                className={className}
                                onClick={() => handleDayClick(day)}
                                aria-label={format(day, 'd MMMM yyyy', { locale: ru })}
                            >
                                <span className={styles.dayNumber}>{format(day, 'd')}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}