import Link from 'next/link'
import { observer } from 'mobx-react-lite'
import ScriptureSearch from '../../components/scripture.search'
import goldenSentenceStore from '../../stores/golden.sentence.store';
import { Typography } from '@material-ui/core';

const GoldenSentence = observer(({ styles }) => {
  const { sentence } = goldenSentenceStore;
  const onUseSearch = (scriptures, search) => {
      goldenSentenceStore.setSentence({search, scriptures})
  }
  return (
    <div className={styles.grid}>
      {sentence.search && (
      <Typography variant="h5" component="h2">
          本周金句: <span className={styles.golden}>{sentence.search}</span>
      </Typography>
      )}
      <ScriptureSearch search={sentence.search} onUseSearch={onUseSearch}></ScriptureSearch>
    </div>
  )
})

export default GoldenSentence