import { observer, useLocalObservable } from 'mobx-react-lite'
import goldenSentenceStore from '../../stores/golden.sentence.store'
import { Typography, Dialog, DialogContent, Button, Card } from '@material-ui/core'
import BibleScripturesSelector from '../../components/bible.scriptures.selector'
import { Book } from '../../common/book'
import { getScriptureSectionTitle, getScriptureSectionText } from '../../utils'

interface GoldenSentenceProps {
  styles: any
}

const GoldenSentence = observer(({ styles }: GoldenSentenceProps) => {
  const { sentence } = goldenSentenceStore
  const local = useLocalObservable(() => ({
    open: sentence == null,
    setOpen(open: boolean) {
      this.open = open
    }
  }))
  const onOpen = () => {
    local.setOpen(true)
  }
  const onClose = () => {
    local.setOpen(false)
  }
  const onScripturesSelected = (book: Book, verses: string[]) => {
    if (verses && verses.length > 0) {
      goldenSentenceStore.setSentence({
        bookName: book.bookName, scriptures: [{
          chapterIndex: book.bookChapterIndex!,
          verses
        }]
      })
    }
    onClose()
  }
  const title = getScriptureSectionTitle(sentence)
  const text = sentence?getScriptureSectionText(sentence.scriptures[0]): null
  return (
    <div className={styles.grid}>
      <Card>
        {title &&
        <Typography variant="h2" component="h2">
          本周金句: <span className={styles.golden}>{title}</span>
        </Typography>
        }
        {text &&
        <Typography variant="h5" component="h5">
          {text}
        </Typography>
        }
        <Button variant="contained" color="primary" onClick={onOpen}>选择金句</Button>
        <Dialog open={local.open} onClose={onClose}>
          <DialogContent>
            <BibleScripturesSelector onScritpuresSelected={onScripturesSelected} />
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  )
})

export default GoldenSentence