import Link from 'next/link'
import { observer } from 'mobx-react-lite'
import ScriptureSearch from '../../components/scripture.search'

const Scriptures = observer(({ styles }) => {
  return (
    <div className={styles.grid}>
      <ScriptureSearch></ScriptureSearch>
    </div>
  )
})

export default Scriptures