import { Cloud, Sun, CloudRain, Snowflake, CloudLightning, Droplets } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';

export type WeatherIcon = ComponentType<LucideProps>;

export const weatherCodes: Record<number, { label: string; Icon: WeatherIcon }> = {
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

export const windDirections = ['С', 'ССВ', 'СВ', 'ВСВ', 'В', 'ВЮВ', 'ЮВ', 'ЮЮВ', 'Ю', 'ЮЮЗ', 'ЮЗ', 'ЗЮЗ', 'З', 'ЗСЗ', 'СЗ', 'ССЗ'];
