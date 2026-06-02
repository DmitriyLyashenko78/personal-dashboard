import { NextRequest, NextResponse } from 'next/server';

// Добавлены GBP и CNY. Можно заменить CNY на KZT, JPY, KRW и т.д.
const SUPPORTED = ['USD', 'EUR', 'RUB', 'BYN', 'GBP', 'CNY'] as const;
type CurrencyCode = (typeof SUPPORTED)[number];

export async function GET(request: NextRequest) {
    const baseParam = request.nextUrl.searchParams.get('base')?.toUpperCase() as CurrencyCode | undefined;
    const base: CurrencyCode = SUPPORTED.includes(baseParam as any) ? baseParam! : 'EUR';

    try {
        const res = await fetch(`https://open.er-api.com/v6/latest/${base}`, {
            next: { revalidate: 300 } // Кэш на сервере: 5 минут
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();

        // Оставляем только нужные валюты, исключая выбранную базовую
        const targetCurrencies = SUPPORTED.filter((c) => c !== base);
        const filteredRates: Record<string, number> = {};
        for (const c of targetCurrencies) {
            filteredRates[c] = data.rates[c] ?? 0;
        }

        const response = NextResponse.json({
            base: data.base_code,
            date: data.time_last_update_utc,
            rates: filteredRates,
        });

        response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
        return response;
    } catch (error) {
        console.error('[Currency API]', error);
        return NextResponse.json(
            { error: 'Не удалось загрузить курсы валют' },
            { status: 502 }
        );
    }
}