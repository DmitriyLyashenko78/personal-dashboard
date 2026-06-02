import { NextResponse } from 'next/server';

// Декодируем HTML-сущности, которые приходят в RSS (например, &amp; → &)
function decodeHtml(html: string): string {
    return html
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

export async function GET() {
    try {
        // Берем официальную RSS ленту новостей Хабра
        const rssUrl = encodeURIComponent('https://habr.com/ru/rss/news/');
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`, {
            next: { revalidate: 600 } // Кэш на сервере: 10 минут
        });

        if (!res.ok) throw new Error('Feed fetch failed');
        const data = await res.json();

        if (data.status !== 'ok' || !data.items?.length) {
            throw new Error('Empty RSS feed');
        }

        // Берем топ-5 свежих новостей
        const news = data.items.slice(0, 5).map((item: any) => ({
            id: item.guid || item.link,
            title: decodeHtml(item.title),
            url: item.link,
            domain: 'habr.com',
            author: item.author || 'Хабр',
            date: new Date(item.pubDate).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
            }),
        }));

        const response = NextResponse.json(news);
        response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=120');
        return response;
    } catch (error) {
        console.error('[News API]', error);
        return NextResponse.json(
            { error: 'Не удалось загрузить новости' },
            { status: 502 }
        );
    }
}