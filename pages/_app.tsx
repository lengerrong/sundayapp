import '../styles/globals.css'
import type { AppProps } from 'next/app'
import layoutStore from '../stores/layout.store'
import { observer } from 'mobx-react-lite'

const MyApp = observer(({ Component, pageProps }: AppProps) => {
  const { Layout, styles } = layoutStore.layout
  pageProps = { ...pageProps, styles }
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
})

export default MyApp
