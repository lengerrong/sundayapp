import Link from 'next/link'
import { observer } from 'mobx-react-lite'
import ScriptureSearch from '../../components/scripture.search'
import preachingSentenceStore from '../../stores/preaching.scriptures.store'
import readingSentenceStore from '../../stores/reading.scriptures.store'
import { Typography } from '@material-ui/core'

const Scriptures = observer(({ styles }) => {
  const onUseSearch = (store, scriptures, search) => {
    store.setSentence({search, scriptures})
}
  return (
    <div className={styles.grid}>
      {readingSentenceStore.sentence.search && (
      <Typography variant="h5" component="h2">
          阅读经文: <span className={styles.reading}>{readingSentenceStore.sentence.search}</span>
      </Typography>
      )} 
      <ScriptureSearch search={readingSentenceStore.sentence.search} onUseSearch={(scriptures, search) => onUseSearch(readingSentenceStore, scriptures, search)}></ScriptureSearch>
      {preachingSentenceStore.sentence.search && (
      <Typography variant="h5" component="h2">
          证道经文: <span className={styles.preaching}>{preachingSentenceStore.sentence.search}</span>
      </Typography>
      )}
      <ScriptureSearch search={preachingSentenceStore.sentence.search} onUseSearch={(scriptures, search) => onUseSearch(preachingSentenceStore, scriptures, search)}></ScriptureSearch>
    </div>
  )
})

export default Scriptures