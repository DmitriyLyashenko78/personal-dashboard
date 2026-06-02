'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type CalendarEvent = {
    id: string;
    title: string;
    description?: string;
    startTime: string;
    endTime?: string;
    location?: string;
    color?: 'blue' | 'green' | 'red' | 'purple' | 'orange';
    createdAt: string;
    updatedAt: string;
};

type CalendarState = {
    events: CalendarEvent[];
    isHydrated: boolean;
    addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
    deleteEvent: (id: string) => void;
    setHydrated: (value: boolean) => void;
};

export const useCalendarStore = create<CalendarState>()(
    persist(
        (set) => ({
            events: [],
            isHydrated: false,
            setHydrated: (value) => set({ isHydrated: value }),

            addEvent: (event) => {
                const now = new Date().toISOString();
                set((state) => ({
                    events: [
                        ...state.events,
                        { ...event, id: crypto.randomUUID(), createdAt: now, updatedAt: now },
                    ],
                }));
            },

            updateEvent: (id, updates) => {
                const now = new Date().toISOString();
                set((state) => ({
                    events: state.events.map((ev) =>
                        ev.id === id ? { ...ev, ...updates, updatedAt: now } : ev
                    ),
                }));
            },

            deleteEvent: (id) => {
                set((state) => ({
                    events: state.events.filter((ev) => ev.id !== id),
                }));
            },
        }),
        {
            name: 'dashboard-calendar-v1',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHydrated(true);
            },
        }
    )
);