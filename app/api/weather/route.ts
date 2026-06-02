import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const lat = request.nextUrl.searchParams.get('lat') || process.env.NEXT_PUBLIC_WEATHER_LAT || '53.9045';
    const lon = request.nextUrl.searchParams.get('lon') || process.env.NEXT_PUBLIC_WEATHER_LON || '27.5615';

    try {
        const url = new URL('https://api.open-meteo.com/v1/forecast');
        url.searchParams.set('latitude', lat);
        url.searchParams.set('longitude', lon);

        // Текущая погода
        url.searchParams.set('current_weather', 'true');

        // Дневные данные (расширенные для модалки)
        url.searchParams.set('daily', [
            'weathercode',
            'temperature_2m_max',
            'temperature_2m_min',
            'sunrise',
            'sunset',
            'precipitation_sum',
            'windspeed_10m_max',
            'windgusts_10m_max',
            'uv_index_max',
        ].join(','));

        // Почасовые данные (для модалки)
        url.searchParams.set('hourly', [
            'temperature_2m',
            'relative_humidity_2m',
            'apparent_temperature',
            'precipitation_probability',
            'precipitation',
            'weathercode',
            'windspeed_10m',
            'winddirection_10m',
            'pressure_msl',
            'cloudcover',
            'visibility',
            'uv_index',
        ].join(','));

        url.searchParams.set('timezone', 'Europe/Minsk');
        url.searchParams.set('forecast_days', '3'); // Только 3 дня

        const res = await fetch(url.toString(), {
            next: { revalidate: 300 }
        });

        if (!res.ok) throw new Error(`Open-Meteo API error: ${res.status}`);

        const data = await res.json();
        const response = NextResponse.json(data);
        response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
        return response;
    } catch (error) {
        console.error('[Weather API]', error);
        return NextResponse.json(
            { error: 'Не удалось загрузить погоду для Минска' },
            { status: 502 }
        );
    }
}