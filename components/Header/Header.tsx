import styles from './Header.module.css';

export default function Header() {
    return (
        <header className={styles.header}>
            <div className="container">
                <div className={styles.headerContent}>
                    <div className={styles.logo}>
                        <span className={styles.bracket}>[</span>
                        <span className={styles.letters}>DL</span>
                        <span className={styles.bracket}>]</span>
                    </div>
                    <nav>Menu</nav>
                </div>
            </div>
        </header>
    );
}