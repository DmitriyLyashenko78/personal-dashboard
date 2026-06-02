
import { CurrencyWidget } from '@/components/widgets/currency/CurrencyWidget';
import styles from './page.module.css';
import {CalendarWidget} from "@/components/widgets/calendar/CalendarWidget";
import {EmailWidget} from "@/components/widgets/email/EmailWidget";
import {WeatherWidget} from "@/components/widgets/weather/WeatherWidget";
import {QuickLinksWidget} from "@/components/widgets/quickLinks/QuickLinksWidget";
import {NewsWidget} from "@/components/widgets/news/NewsWidget";

export default function DashboardPage() {
    return (
        <main className={styles.container}>
            <section className={styles.grid}>
                <NewsWidget />
                <CurrencyWidget />
                <WeatherWidget />
                <EmailWidget />
                <CalendarWidget />

                <QuickLinksWidget/>

            </section>
        </main>
    );
}