'use client';

import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarDays, Clock, MapPin, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { WidgetShell } from '@/components/ui/WidgetShell';
import { useCalendarStore, CalendarEvent } from '@/lib/store/calendarStore';
import { EventModal } from './EventModal';
import styles from './CalendarWidget.module.css';

export function CalendarWidget() {
    const { events, isHydrated, addEvent, updateEvent, deleteEvent } = useCalendarStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [modalInitialData, setModalInitialData] = useState<CalendarEvent | null>(null);
    const [ready, setReady] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());

    useEffect(() => {
        if (isHydrated) setReady(true);
    }, [isHydrated]);

    const formattedViewDate = format(viewDate, 'd MMMM yyyy, EEEE', { locale: ru });

    const filteredEvents = useMemo(() => {
        if (!ready) return [];

        const start = new Date(viewDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(viewDate);
        end.setHours(23, 59, 59, 999);

        return events
            .filter((ev) => {
                const eventDate = new Date(ev.startTime);
                return eventDate >= start && eventDate <= end;
            })
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [ready, viewDate, events]);

    const handleAdd = () => {
        const now = new Date();
        const nextHour = new Date(now);
        nextHour.setHours(now.getHours() + 1, 0, 0, 0);
        const endHour = new Date(nextHour);
        endHour.setHours(endHour.getHours() + 1);

        setModalInitialData({
            id: '',
            title: '',
            description: '',
            startTime: nextHour.toISOString(),
            endTime: endHour.toISOString(),
            location: '',
            color: 'blue',
            createdAt: '',
            updatedAt: '',
        });
        setEditingEvent(null);
        setIsModalOpen(true);
    };

    const handleEdit = (event: CalendarEvent, e: React.MouseEvent) => {
        e.stopPropagation();
        setModalInitialData(event);
        setEditingEvent(event);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Удалить это событие?')) deleteEvent(id);
    };

    const handleSave = (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (editingEvent) updateEvent(editingEvent.id, eventData);
        else addEvent(eventData);

        setIsModalOpen(false);
        setModalInitialData(null);
        setViewDate(new Date(eventData.startTime));
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalInitialData(null);
    };

    const goToPreviousDay = () => {
        const d = new Date(viewDate); d.setDate(d.getDate() - 1); setViewDate(d);
    };
    const goToNextDay = () => {
        const d = new Date(viewDate); d.setDate(d.getDate() + 1); setViewDate(d);
    };
    const goToToday = () => setViewDate(new Date());

    if (!ready) {
        return (
            <WidgetShell title="Календарь" icon={<CalendarDays />}>
                <div className={styles.layout}>
                    <div className={styles.header}>
                        <span className={styles.date}>Загрузка...</span>
                        <span className={styles.tag}>—</span>
                    </div>
                    <div className={styles.actions}>
                        <button className={styles.addButton} disabled>
                            <Plus size={14} /> Добавить
                        </button>
                    </div>
                    <ul className={styles.list}>
                        {[1, 2, 3].map((i) => (
                            <li key={i} className={styles.event}>
                                <div className={styles.meta}>
                                    <Clock size={14} />
                                    <span className={styles.skeleton} style={{ width: 40 }} />
                                </div>
                                <span className={styles.title}><span className={styles.skeleton} style={{ width: 120 }} /></span>
                            </li>
                        ))}
                    </ul>
                </div>
            </WidgetShell>
        );
    }

    return (
        <>
            <WidgetShell title="Календарь" icon={<CalendarDays />}>
                <div className={styles.layout}>
                    <div className={styles.header}>
                        <div className={styles.dateNav}>
                            <button className={styles.navButton} onClick={goToPreviousDay} aria-label="Предыдущий день">
                                <ChevronLeft size={16} />
                            </button>
                            <button className={styles.todayButton} onClick={goToToday}>
                                <span className={styles.date} suppressHydrationWarning>{formattedViewDate}</span>
                            </button>
                            <button className={styles.navButton} onClick={goToNextDay} aria-label="Следующий день">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                        <span className={styles.tag}>{events.length} всего</span>
                    </div>

                    <div className={styles.actions}>
                        <button className={styles.addButton} onClick={handleAdd}>
                            <Plus size={14} /> Добавить
                        </button>
                    </div>

                    <ul className={styles.list}>
                        {filteredEvents.length === 0 ? (
                            <li className={styles.empty}>
                                Нет событий на {format(viewDate, 'd MMMM', { locale: ru })} 📅
                                <br />
                                Нажмите «Добавить», чтобы создать
                            </li>
                        ) : (
                            filteredEvents.map((ev) => (
                                <li key={ev.id} className={`${styles.event} ${styles[ev.color || 'blue']}`}>
                                    <div className={styles.eventActions}>
                                        <button className={styles.iconButton} onClick={(e) => handleEdit(ev, e)} aria-label="Редактировать">
                                            <Pencil size={14} />
                                        </button>
                                        <button className={`${styles.iconButton} ${styles.delete}`} onClick={(e) => handleDelete(ev.id, e)} aria-label="Удалить">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className={styles.meta}>
                                        <Clock size={14} />
                                        <span>
                      {format(new Date(ev.startTime), 'HH:mm')}
                                            {ev.endTime && ` – ${format(new Date(ev.endTime), 'HH:mm')}`}
                    </span>
                                    </div>
                                    <span className={styles.title}>{ev.title}</span>
                                    {ev.description && <p className={styles.description}>{ev.description}</p>}
                                    {ev.location && (
                                        <div className={styles.location}>
                                            <MapPin size={12} /> <span>{ev.location}</span>
                                        </div>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </WidgetShell>

            <EventModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSave} initialData={modalInitialData} />
        </>
    );
}