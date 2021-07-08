import Link from 'next/link'
import { observer } from 'mobx-react-lite'

const Preaching = observer(({ styles }) => {
  return (
    <div className={styles.grid}>
      This is the page for select Preaching
    </div>
  )
})

export default Preaching