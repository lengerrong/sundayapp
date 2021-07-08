import Link from 'next/link'
import { observer } from 'mobx-react-lite'

const Songs = observer(({ styles }) => {
  return (
    <div className={styles.grid}>
      This is the page for select songs
    </div>
  )
})

export default Songs