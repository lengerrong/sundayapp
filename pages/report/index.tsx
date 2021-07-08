import Link from 'next/link'
import { observer } from 'mobx-react-lite'

const Report = observer(({ styles }) => {
  return (
    <div className={styles.grid}>
      This is the page for select report
    </div>
  )
})

export default Report