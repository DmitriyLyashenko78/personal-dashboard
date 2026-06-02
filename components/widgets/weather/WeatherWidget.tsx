'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { WidgetShell } from '@/components/ui/WidgetShell';
import { Cloud, Sun, CloudRain, Snowflake, CloudLightning, AlertCircle, Wind } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { WeatherModal } from './WeatherModal';
import styles from './WeatherWidget.module.css';
import type { ComponentType } from 'react';

type WeatherIcon = ComponentType<LucideProps>;

const weatherCodes: Record<number, { label: string; Icon: WeatherIcon }> = {
    0: { label: 'Ясно', Icon: Sun },
    1: { label: 'Преимущественно ясно', Icon: Sun },
    2: { label: 'Переменная облачность', Icon: Cloud },
    3: { label: 'Пасмурно', Icon: Cloud },
    45: { label: 'Туман', Icon: Cloud },
    48: { label: 'Изморозь', Icon: Snowflake },
    51: { label: 'Лёгкая морось', Icon: CloudRain },
    61: { label: 'Дождь', Icon: CloudRain },
    63: { label: 'Сильный дождь', Icon: CloudRain },
    71: { label: 'Снег', Icon: Snowflake },
    80: { label: 'Ливень', Icon: CloudRain },
    95: { label: 'Гроза', Icon: CloudLightning },
};

const windDirections = ['С', 'ССВ', 'СВ', 'ВСВ', 'В', 'ВЮВ', 'ЮВ', 'ЮЮВ', 'Ю', 'ЮЮЗ', 'ЮЗ', 'ЗЮЗ', 'З', 'ЗСЗ', 'СЗ', 'ССЗ'];

interface WeatherData {
    current_weather: {
        temperature: number;
        weathercode: number;
        windspeed: number;
        winddirection: number
    };
    daily: {
        time: string[];
        weathercode: number[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        sunrise: string[];
        sunset: string[];
        precipitation_sum: number[];
        windspeed_10m_max: number[];
        uv_index_max: number[];
    };
    hourly: {
        time: string[];
        temperature_2m: number[];
        relative_humidity_2m: number[];
        apparent_temperature: number[];
        precipitation_probability: number[];
        precipitation: number[];
        weathercode: number[];
        windspeed_10m: number[];
        winddirection_10m: number[];
        pressure_msl: number[];
        cloudcover: number[];
        visibility: number[];
        uv_index: number[];
    };
}

export function WeatherWidget() {
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const { data, isLoading, error } = useQuery<WeatherData>({
        queryKey: ['weather'],
        queryFn: async () => {
            const res = await fetch('/api/weather');
            if (!res.ok) throw new Error('Failed to fetch weather');
            return res.json();
        },
    });

    if (isLoading) return <WidgetShell title="Погода (Минск)" icon={<Cloud />} isLoading />;
    if (error) {
        return (
            <WidgetShell title="Погода (Минск)" icon={<Cloud />}>
                <div className={styles.state}><AlertCircle size={18} /><span>Ошибка загрузки погоды</span></div>
            </WidgetShell>
        );
    }

    const cw = data?.current_weather;
    const daily = data?.daily;
    const hourly = data?.hourly;
    if (!cw || !daily || !hourly) return null;

    const code = cw.weathercode ?? 3;
    const { label, Icon } = weatherCodes[code] || { label: 'Облачно', Icon: Cloud };
    const temp = Math.round(cw.temperature);
    const windSpeed = Math.round(cw.windspeed);
    const windDeg = cw.winddirection ?? 0;
    const windDir = windDirections[Math.round(windDeg / 22.5) % 16];

    const forecast = daily.time.slice(0, 3).map((time: string, i: number) => ({
        date: new Date(time),
        code: daily.weathercode[i],
        max: Math.round(daily.temperature_2m_max[i]),
        min: Math.round(daily.temperature_2m_min[i]),
    }));

    return (
        <WidgetShell title="Погода (Минск)" icon={<Cloud />}>
            <div className={styles.current}>
                <div className={styles.mainInfo}>
                    <Icon size={32} className={styles.icon} />
                    <span className={styles.temp}>{temp > 0 ? `+${temp}` : temp}°C</span>
                </div>
                <div className={styles.details}>
                    <span>{label}</span>
                    <span className={styles.divider}>•</span>
                    <span className={styles.wind}><Wind size={14} />{windSpeed} км/ч, {windDir}</span>
                </div>
            </div>

            <div className={styles.forecast}>
                {forecast.map((day, i) => {
                    const { Icon: DayIcon } = weatherCodes[day.code] || { Icon: Cloud };
                    const dayName = i === 0 ? 'Сегодня' : format(day.date, 'EEE', { locale: ru });
                    return (
                        <div
                            key={day.date.toISOString()}
                            className={styles.forecastItem}
                            onClick={() => setSelectedDay(i)}
                        >
                            <span className={styles.dayName}>{dayName}</span>
                            <DayIcon size={20} className={styles.forecastIcon} />
                            <div className={styles.forecastTemp}>
                                <span className={styles.max}>{day.max > 0 ? `+${day.max}` : day.max}°</span>
                                <span className={styles.min}>{day.min > 0 ? `+${day.min}` : day.min}°</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedDay !== null && (
                <WeatherModal
                    dayIndex={selectedDay}
                    hourly={hourly}
                    daily={daily}
                    onClose={() => setSelectedDay(null)}
                />
            )}
        </WidgetShell>
    );
}