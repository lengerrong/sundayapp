import Link from 'next/link'
import { observer } from 'mobx-react-lite'
import SongSelect from '../../components/song.selector'

const Songs = observer(({ styles }) => {
  return (
    <div className={styles.grid}>
      <SongSelect />
    </div>
  )
})

export default Songs