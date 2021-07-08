import Link from 'next/link'
import { observer } from 'mobx-react-lite'

const Minister = observer(({ styles }) => {
  return (
    <div className={styles.grid}>
      This is the page for select Minister
    </div>
  )
})

export default Minister