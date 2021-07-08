import Link from 'next/link'
import { observer } from 'mobx-react-lite'

const GoldenSentence = observer(({ styles }) => {
  return (
    <div className={styles.grid}>
      This is the page for select GoldenSentence
    </div>
  )
})

export default GoldenSentence