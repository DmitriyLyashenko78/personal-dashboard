'use client';

import { useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { X, Sunrise, Sunset, Droplets, Wind, Eye, Cloud, Thermometer, Gauge, Sun } from 'lucide-react';
import styles from './WeatherModal.module.css';
import { weatherCodes } from './weatherConstants';

interface HourlyData {
    time: string[];
    temperature_2m: number[];
    weathercode: number[];
    precipitation_probability: number[];
    windspeed_10m: number[];
    relative_humidity_2m: number[];
    apparent_temperature: number[];
    pressure_msl: number[];
    cloudcover: number[];
    visibility: number[];
    uv_index: number[];
}

interface DailyData {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    precipitation_sum: number[];
    windspeed_10m_max: number[];
    uv_index_max: number[];
}

interface WeatherModalProps {
    dayIndex: number;
    hourly: HourlyData;
    daily: DailyData;
    onClose: () => void;
}

export function WeatherModal({ dayIndex, hourly, daily, onClose }: WeatherModalProps) {
    // Закрытие по Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden'; // Блокируем скролл

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    const date = new Date(daily.time[dayIndex]);
    const dayName = dayIndex === 0 ? 'Сегодня' : format(date, 'EEEE', { locale: ru });
    const dateStr = format(date, 'd MMMM', { locale: ru });

    const { Icon: DayIcon, label } = weatherCodes[daily.weathercode[dayIndex]] || { Icon: Cloud, label: 'Облачно' };

    const maxTemp = Math.round(daily.temperature_2m_max[dayIndex]);
    const minTemp = Math.round(daily.temperature_2m_min[dayIndex]);
    const sunrise = daily.sunrise[dayIndex] ? format(new Date(daily.sunrise[dayIndex]), 'HH:mm') : '—';
    const sunset = daily.sunset[dayIndex] ? format(new Date(daily.sunset[dayIndex]), 'HH:mm') : '—';
    const precipitation = daily.precipitation_sum[dayIndex] ?? 0;
    const maxWind = Math.round(daily.windspeed_10m_max[dayIndex] ?? 0);
    const uvMax = Math.round(daily.uv_index_max[dayIndex] ?? 0);

    // Почасовые данные для этого дня (24 часа)
    const startHour = dayIndex * 24;
    const hourlyData = Array.from({ length: 24 }, (_, i) => {
        const hourIndex = startHour + i;
        return {
            time: format(new Date(hourly.time[hourIndex]), 'HH:mm'),
            temp: Math.round(hourly.temperature_2m[hourIndex]),
            code: hourly.weathercode[hourIndex],
            precipProb: hourly.precipitation_probability[hourIndex] ?? 0,
            wind: Math.round(hourly.windspeed_10m[hourIndex] ?? 0),
            humidity: hourly.relative_humidity_2m[hourIndex] ?? 0,
            feelsLike: Math.round(hourly.apparent_temperature[hourIndex] ?? 0),
            pressure: Math.round(hourly.pressure_msl[hourIndex] ?? 0),
            cloud: hourly.cloudcover[hourIndex] ?? 0,
            visibility: Math.round((hourly.visibility[hourIndex] ?? 0) / 1000), // в км
            uv: Math.round(hourly.uv_index[hourIndex] ?? 0),
        };
    });

    // Средние показатели за день
    const avgHumidity = Math.round(hourlyData.reduce((sum, h) => sum + h.humidity, 0) / 24);
    const avgPressure = Math.round(hourlyData.reduce((sum, h) => sum + h.pressure, 0) / 24);
    const avgVisibility = Math.round(hourlyData.reduce((sum, h) => sum + h.visibility, 0) / 24);

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
                    <X size={20} />
                </button>

                <div className={styles.header}>
                    <DayIcon size={48} className={styles.headerIcon} />
                    <div className={styles.headerInfo}>
                        <h2 className={styles.dayName}>{dayName}</h2>
                        <p className={styles.dateStr}>{dateStr}</p>
                        <p className={styles.weatherLabel}>{label}</p>
                    </div>
                    <div className={styles.headerTemp}>
                        <span className={styles.maxTemp}>{maxTemp > 0 ? `+${maxTemp}` : maxTemp}°</span>
                        <span className={styles.minTemp}>{minTemp > 0 ? `+${minTemp}` : minTemp}°</span>
                    </div>
                </div>

                <div className={styles.summary}>
                    <div className={styles.summaryItem}>
                        <Sunrise size={18} />
                        <span>{sunrise}</span>
                    </div>
                    <div className={styles.summaryItem}>
                        <Sunset size={18} />
                        <span>{sunset}</span>
                    </div>
                    <div className={styles.summaryItem}>
                        <Droplets size={18} />
                        <span>{precipitation} мм</span>
                    </div>
                    <div className={styles.summaryItem}>
                        <Wind size={18} />
                        <span>{maxWind} км/ч</span>
                    </div>
                    <div className={styles.summaryItem}>
                        <Sun size={18} />
                        <span>УФ {uvMax}</span>
                    </div>
                </div>

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Почасовой прогноз</h3>
                    <div className={styles.hourlyScroll}>
                        {hourlyData.map((hour, i) => {
                            const { Icon: HourIcon } = weatherCodes[hour.code] || { Icon: Cloud };
                            return (
                                <div key={i} className={styles.hourItem}>
                                    <span className={styles.hourTime}>{hour.time}</span>
                                    <HourIcon size={20} className={styles.hourIcon} />
                                    <span className={styles.hourTemp}>
                                        {hour.temp > 0 ? `+${hour.temp}` : hour.temp}°
                                    </span>
                                    {hour.precipProb > 0 && (
                                        <span className={styles.hourPrecip}>{hour.precipProb}%</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Подробности</h3>
                    <div className={styles.details}>
                        <div className={styles.detailItem}>
                            <Thermometer size={16} />
                            <span>Ощущается как</span>
                            <strong>{hourlyData[12].feelsLike > 0 ? `+${hourlyData[12].feelsLike}` : hourlyData[12].feelsLike}°</strong>
                        </div>
                        <div className={styles.detailItem}>
                            <Droplets size={16} />
                            <span>Влажность</span>
                            <strong>{avgHumidity}%</strong>
                        </div>
                        <div className={styles.detailItem}>
                            <Gauge size={16} />
                            <span>Давление</span>
                            <strong>{avgPressure} гПа</strong>
                        </div>
                        <div className={styles.detailItem}>
                            <Eye size={16} />
                            <span>Видимость</span>
                            <strong>{avgVisibility} км</strong>
                        </div>
                        <div className={styles.detailItem}>
                            <Cloud size={16} />
                            <span>Облачность</span>
                            <strong>{hourlyData[12].cloud}%</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}