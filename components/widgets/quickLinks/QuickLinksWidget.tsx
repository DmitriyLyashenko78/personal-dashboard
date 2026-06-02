'use client';
import { useState } from 'react';
import { useBookmarkStore } from '@/lib/store/bookmarkStore';
import { WidgetShell } from '@/components/ui/WidgetShell';
import { ExternalLink, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import styles from './QuickLinksWidget.module.css';

export function QuickLinksWidget() {
    const { bookmarks, addBookmark, updateBookmark, deleteBookmark } = useBookmarkStore();

    const [newTitle, setNewTitle] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editUrl, setEditUrl] = useState('');

    const handleAdd = () => {
        if (newTitle.trim() && newUrl.trim()) {
            addBookmark(newTitle.trim(), newUrl.trim());
            setNewTitle('');
            setNewUrl('');
        }
    };

    const startEdit = (id: string, title: string, url: string) => {
        setEditingId(id);
        setEditTitle(title);
        setEditUrl(url);
    };

    const saveEdit = () => {
        if (editingId && editTitle.trim() && editUrl.trim()) {
            updateBookmark(editingId, editTitle.trim(), editUrl.trim());
            setEditingId(null);
        }
    };

    return (
        <WidgetShell title="Закладки" icon={<ExternalLink />}>
            <form className={styles.addForm} onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
                <input
                    type="text"
                    placeholder="Название"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className={styles.input}
                    required
                />
                <input
                    type="url"
                    placeholder="https://..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className={styles.input}
                    required
                />
                <button type="submit" className={styles.addBtn} aria-label="Добавить закладку">
                    <Plus size={16} />
                </button>
            </form>

            <ul className={styles.list}>
                {bookmarks.map((bm) => (
                    <li key={bm.id} className={styles.item}>
                        {editingId === bm.id ? (
                            <div className={styles.editRow}>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className={styles.inputSm}
                                    autoFocus
                                />
                                <input
                                    type="url"
                                    value={editUrl}
                                    onChange={(e) => setEditUrl(e.target.value)}
                                    className={styles.inputSm}
                                />
                                <div className={styles.editActions}>
                                    <button onClick={saveEdit} className={styles.iconBtn} aria-label="Сохранить"><Check size={14} /></button>
                                    <button onClick={() => setEditingId(null)} className={styles.iconBtn} aria-label="Отменить"><X size={14} /></button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <a href={bm.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                                    <ExternalLink size={14} className={styles.linkIcon} />
                                    <span className={styles.linkTitle}>{bm.title}</span>
                                </a>
                                <div className={styles.actions}>
                                    <button onClick={() => startEdit(bm.id, bm.title, bm.url)} className={styles.iconBtn} aria-label="Редактировать">
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => deleteBookmark(bm.id)} className={styles.iconBtn} aria-label="Удалить">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </WidgetShell>
    );
}