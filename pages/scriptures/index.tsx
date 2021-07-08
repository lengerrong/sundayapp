import Link from 'next/link'
import { observer } from 'mobx-react-lite'

const Scriptures = observer(({ styles }) => {
  return (
    <div className={styles.grid}>
      This is the page for select Scriptures
    </div>
  )
})

export default Scriptures