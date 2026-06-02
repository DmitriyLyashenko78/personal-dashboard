// app/api/email/route.ts
import { NextResponse } from 'next/server';
import { ImapFlow } from 'imapflow';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

// ── Типы ──────────────────────────────────────────────────────
export interface EmailItem {
    id: string;
    from: string;
    subject: string;
    date: string;
    unread: boolean;
}

type ImapAddress = { name?: string; address?: string } | null;

// ── Утилиты ───────────────────────────────────────────────────
function decodeAddress(addr: ImapAddress): string {
    if (!addr || (!addr.name && !addr.address)) return 'Неизвестный';
    const formatted = `${addr.name || ''} <${addr.address || ''}>`.trim();
    return formatted.replace(/^<\s*|\s*>$/g, '') || 'Неизвестный';
}

// ── Handler ───────────────────────────────────────────────────
export async function GET() {
    // 🎯 МОК-РЕЖИМ: Если включен или нет пароля, отдаем безопасные демо-данные
    if (process.env.EMAIL_MOCK === 'true' || !process.env.YANDEX_APP_PASSWORD) {
        // Имитируем небольшую задержку сети, чтобы в UI красиво отработал skeleton
        await new Promise((resolve) => setTimeout(resolve, 600));

        return NextResponse.json<EmailItem[]>([
            { id: 'mock-1', from: 'support@yandex.ru', subject: 'Добро пожаловать в портфолио', date: '8 мая 14:30', unread: true },
            { id: 'mock-2', from: 'github@notifications.com', subject: '[PR] Merged: dashboard-widgets', date: '7 мая 19:15', unread: true },
            { id: 'mock-3', from: 'newsletter@habr.com', subject: 'Лучшее за неделю: Next.js 15', date: '6 мая 10:00', unread: false },
        ]);
    }

    const email = process.env.YANDEX_EMAIL;
    const pass = process.env.YANDEX_APP_PASSWORD;

    if (!email || !pass) {
        return NextResponse.json({ error: 'Не настроены YANDEX_EMAIL / YANDEX_APP_PASSWORD' }, { status: 500 });
    }

    let client: ImapFlow | undefined;

    try {
        console.log('[Email] 🔌 Connecting via imapflow...');

        client = new ImapFlow({
            host: 'imap.yandex.ru',
            port: 993,
            secure: true,
            auth: { user: email, pass },
            logger: false,
            // Локальный workaround для dev-окружения. Не влияет на остальное приложение.
            tls: {
                rejectUnauthorized: process.env.NODE_ENV === 'production' ? true : false
            },
        });

        await client.connect();
        console.log('[Email] ✅ Authorized');

        const lock = await client.getMailboxLock('INBOX');
        try {
            const searchResult = await client.search({ all: true });
            const allUids = Array.isArray(searchResult) ? searchResult : [];
            const lastUids = allUids.slice(-5);

            if (lastUids.length === 0) {
                return NextResponse.json<EmailItem[]>([]);
            }

            const messages: EmailItem[] = [];

            for await (const msg of client.fetch(lastUids, { envelope: true, flags: true })) {
                const from = decodeAddress(msg.envelope?.from?.[0] ?? null);
                const subject = msg.envelope?.subject?.trim() || 'Без темы';

                let date = 'Недавно';
                if (msg.envelope?.date) {
                    try {
                        date = format(new Date(msg.envelope.date), 'd MMM HH:mm', { locale: ru });
                    } catch {
                        date = 'Недавно';
                    }
                }

                const isSeen = msg.flags?.has('\\Seen') ?? false;

                messages.push({
                    id: msg.uid?.toString() || crypto.randomUUID(),
                    from,
                    subject,
                    date,
                    unread: !isSeen,
                });
            }

            console.log('[Email] 📦 Fetched', messages.length, 'emails');
            return NextResponse.json(messages.reverse());

        } finally {
            lock.release();
        }

    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('[Email] 🚨 Failed:', msg);
        return NextResponse.json({ error: 'Ошибка подключения к почте' }, { status: 502 });
    } finally {
        try {
            if (client?.authenticated) {
                await client.logout();
            }
        } catch (logoutError) {
            console.warn('[Email] ⚠️ Warning during logout:', logoutError);
        }
    }
}