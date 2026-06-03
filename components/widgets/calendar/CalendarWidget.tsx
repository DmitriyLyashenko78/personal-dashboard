'use client';

import {useState, useEffect, useMemo} from 'react';
import {format} from 'date-fns';
import {ru} from 'date-fns/locale';
import {CalendarDays, Clock, MapPin, Plus, Pencil, Trash2, ChevronLeft, ChevronRight} from 'lucide-react';
import {WidgetShell} from '@/components/ui/WidgetShell';
import {useCalendarStore, CalendarEvent} from '@/lib/store/calendarStore';
import {EventModal} from './EventModal';
import styles from './CalendarWidget.module.css';
import {CalendarMonthModal} from './CalendarMonthModal';

function CalendarIconButton({onClick}: {onClick: () => void}) {
    return (
        <button
            type="button"
            className={styles.calendarIconButton}
            onClick={onClick}
            aria-label="Открыть календарь на месяц"
            title="Открыть календарь на месяц"
        >
            <CalendarDays />
        </button>
    );
}

function SkeletonEvent({style}: {style?: React.CSSProperties}) {
    return (
        <li className={styles.event} style={style}>
            <div className={styles.meta}>
                <Clock size={14}/>
                <span className={styles.skeleton} style={{width: 40}}/>
            </div>
            <span className={styles.title}>
                <span className={styles.skeleton} style={{width: 120}}/>
            </span>
        </li>
    );
}

function EventItem({event, onEdit, onDelete}: {
    event: CalendarEvent;
    onEdit: (event: CalendarEvent, e: React.MouseEvent) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
}) {
    return (
        <li className={`${styles.event} ${styles[event.color || 'blue']}`}>
            <div className={styles.eventActions}>
                <button className={styles.iconButton} onClick={(e) => onEdit(event, e)} aria-label="Редактировать">
                    <Pencil size={14}/>
                </button>
                <button className={`${styles.iconButton} ${styles.delete}`} onClick={(e) => onDelete(event.id, e)} aria-label="Удалить">
                    <Trash2 size={14}/>
                </button>
            </div>
            <div className={styles.meta}>
                <Clock size={14}/>
                <span>
                    {format(new Date(event.startTime), 'HH:mm')}
                    {event.endTime && ` – ${format(new Date(event.endTime), 'HH:mm')}`}
                </span>
            </div>
            <span className={styles.title}>{event.title}</span>
            {event.description && <p className={styles.description}>{event.description}</p>}
            {event.location && (
                <div className={styles.location}>
                    <MapPin size={12}/> <span>{event.location}</span>
                </div>
            )}
        </li>
    );
}

export function CalendarWidget() {
    const {events, isHydrated, addEvent, updateEvent, deleteEvent} = useCalendarStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [modalInitialData, setModalInitialData] = useState<CalendarEvent | null>(null);
    const [ready, setReady] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);

    useEffect(() => {
        if (isHydrated) setReady(true);
    }, [isHydrated]);

    const formattedViewDate = format(viewDate, 'd MMMM yyyy, EEEE', {locale: ru});

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

    const goToDay = (offset: number) => {
        const d = new Date(viewDate);
        d.setDate(d.getDate() + offset);
        setViewDate(d);
    };

    const goToToday = () => setViewDate(new Date());

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

        handleCloseModal();
        setViewDate(new Date(eventData.startTime));
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalInitialData(null);
    };

    const calendarIcon = <CalendarIconButton onClick={() => setIsMonthModalOpen(true)} />;

    return (
        <>
            <WidgetShell title="Календарь" icon={calendarIcon}>
                <div className={styles.layout}>
                    <div className={styles.header}>
                        {ready ? (
                            <>
                                <div className={styles.dateNav}>
                                    <button className={styles.navButton} onClick={() => goToDay(-1)} aria-label="Предыдущий день">
                                        <ChevronLeft size={16}/>
                                    </button>
                                    <button className={styles.todayButton} onClick={goToToday}>
                                        <span className={styles.date} suppressHydrationWarning>{formattedViewDate}</span>
                                    </button>
                                    <button className={styles.navButton} onClick={() => goToDay(1)} aria-label="Следующий день">
                                        <ChevronRight size={16}/>
                                    </button>
                                </div>
                                <span className={styles.tag}>{events.length} всего</span>
                            </>
                        ) : (
                            <>
                                <span className={styles.date}>Загрузка...</span>
                                <span className={styles.tag}>—</span>
                            </>
                        )}
                    </div>

                    <div className={styles.actions}>
                        <button className={styles.addButton} onClick={handleAdd} disabled={!ready}>
                            <Plus size={14}/> Добавить
                        </button>
                    </div>

                    <ul className={styles.list}>
                        {!ready ? (
                            <>
                                <SkeletonEvent />
                                <SkeletonEvent />
                                <SkeletonEvent />
                            </>
                        ) : filteredEvents.length === 0 ? (
                            <li className={styles.empty}>
                                Нет событий на {format(viewDate, 'd MMMM', {locale: ru})}
                                <br/>
                                Нажмите «Добавить», чтобы создать
                            </li>
                        ) : (
                            filteredEvents.map((ev) => (
                                <EventItem key={ev.id} event={ev} onEdit={handleEdit} onDelete={handleDelete} />
                            ))
                        )}
                    </ul>
                </div>
            </WidgetShell>

            <CalendarMonthModal
                isOpen={isMonthModalOpen}
                onClose={() => setIsMonthModalOpen(false)}
                events={events}
                onSelectDate={setViewDate}
                initialMonth={viewDate}
            />
            <EventModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSave} initialData={modalInitialData}/>
        </>
    );
}
