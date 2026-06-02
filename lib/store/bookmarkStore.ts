import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Bookmark = { id: string; title: string; url: string };

interface BookmarkStore {
    bookmarks: Bookmark[];
    addBookmark: (title: string, url: string) => void;
    updateBookmark: (id: string, title: string, url: string) => void;
    deleteBookmark: (id: string) => void;
}

export const useBookmarkStore = create<BookmarkStore>()(
    persist(
        (set) => ({
            bookmarks: [
                { id: '1', title: 'GitHub', url: 'https://github.com' },
                { id: '2', title: 'Figma', url: 'https://figma.com' },
            ],
            addBookmark: (title, url) => set((state) => ({
                bookmarks: [...state.bookmarks, { id: crypto.randomUUID(), title, url }]
            })),
            updateBookmark: (id, title, url) => set((state) => ({
                bookmarks: state.bookmarks.map((b) => b.id === id ? { ...b, title, url } : b)
            })),
            deleteBookmark: (id) => set((state) => ({
                bookmarks: state.bookmarks.filter((b) => b.id !== id)
            })),
        }),
        { name: 'dashboard-bookmarks' } // Ключ в localStorage
    )
);