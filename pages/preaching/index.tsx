import { observer } from 'mobx-react-lite'
import { TextareaAutosize } from '@material-ui/core'
import preachingArticleStore from '../../stores/preaching.article.store'

const Preaching = observer(({ styles }) => {
  const { content } = preachingArticleStore
  const onChange = (e) => {
    preachingArticleStore.setContent(e.target.value)
  }
  return (
    <div className={styles.grid}>
     <h1>证道主题</h1>
      <TextareaAutosize
        minRows={3}
        placeholder="主题&#10;I.&#10;II.&#10;"
        className={styles.textarea}
        value={content}
        onChange={onChange}
      />
    </div>
  )
})

export default Preaching