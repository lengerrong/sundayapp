import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import styles from '../styles/default.layout.module.css'

const Layout = ({ children }) => {
    return (
        <div className={styles.container}>
            <Head>
                <title>主日敬拜事工</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <header className={styles.header}>
            <h1 className={styles.title}>
                欢迎来到 <Link href="/">主日敬拜事工小组</Link>
            </h1>

            <p className={styles.description}>
            总括来说，你们要彼此同心，互相体恤，亲爱像弟兄，满有温柔，存心谦卑。 (彼得前书3:8 新译本)
            </p>

            </header>

            <main className={styles.main}>
                {children}
            </main>

            <footer className={styles.footer}>
                <a
                    href="https://chinesereformedchurch.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span className={styles.logo}>
                        <Image src="/logo.svg" alt="Vercel Logo" width={95} height={101} />
                    </span>
                </a>
            </footer>
        </div>
    )
}

const DefaultLayout = {
    name: 'default',
    Layout,
    styles
}

export default DefaultLayout