import { observer, useLocalObservable } from 'mobx-react-lite'
import { Button, Dialog, DialogContent, Chip, ListItem, List, Snackbar, Typography } from '@material-ui/core'
import preachingSentenceStore from '../../stores/preaching.scriptures.store'
import readingSentenceStore from '../../stores/reading.scriptures.store'
import BibleScripturesSelector from '../../components/bible.scriptures.selector'
import { Book } from '../../common/book'
import { ScriptureSection } from '../../common/scritpure.section'
import { getScriptureSectionTitle } from '../../utils'
import Alert from '../../components/alert'

enum ScriptureType {
  None,
  ReadingScripture,
  PreachingScripture
}

const Scriptures = observer(({ styles }) => {
  const local = useLocalObservable(() => ({
    open: false,
    scriptureType: ScriptureType.None,
    openSideBar: false,
    scriptureSection: null as unknown as ScriptureSection,
    setOpen(open: boolean) {
      this.open = open
    },
    setOpenSideBar(openSideBar: boolean) {
      this.openSideBar = openSideBar
    },
    setScriptureSection(scriptureSection: ScriptureSection) {
      this.scriptureSection = scriptureSection
    },
    setScriptureType(scriptureType: ScriptureType) {
      this.scriptureType = scriptureType
    }
  }))
  const onClose = () => {
    local.setOpen(false)
  }
  const onScripturesSelected = (book: Book, verses: string[]) => {
    if (verses && verses.length > 0) {
      let store = local.scriptureType === ScriptureType.ReadingScripture ? readingSentenceStore :
        preachingSentenceStore
      let scriptureSections = [...store.scriptureSections]
      scriptureSections.push({
        bookName: book.bookName, scriptures: [{
          chapterIndex: book.bookChapterIndex!,
          verses
        }]
      })
      store.setScriptureSections(scriptureSections)
    }
    onClose()
  }
  const onAddReadingScripturesClicked = () => {
    local.setScriptureType(ScriptureType.ReadingScripture)
    local.setOpen(true)
  }
  const onAddPreachingScripturesClicked = () => {
    local.setScriptureType(ScriptureType.PreachingScripture)
    local.setOpen(true)
  }
  const onScriptureSectionClick = (scriptureSection: ScriptureSection) => {
    local.setOpenSideBar(true)
    local.setScriptureSection(scriptureSection)
  }
  const onDeleteScriptureSection = (scriptureSection: ScriptureSection, scriptureType: ScriptureType) => {
    let store = scriptureType === ScriptureType.ReadingScripture ? readingSentenceStore : preachingSentenceStore
    let index = store.scriptureSections.indexOf(scriptureSection)
    let newscriptureSections = Array.from(store.scriptureSections)
    newscriptureSections.splice(index, 1)
    store.setScriptureSections(newscriptureSections)
  }
  const renderScriptureSection = (scriptureSection: ScriptureSection, scriptureType: ScriptureType) => {
    return <ListItem key={getScriptureSectionTitle(scriptureSection) + scriptureType} button>
      <Chip clickable label={getScriptureSectionTitle(scriptureSection)}
        onClick={() => onScriptureSectionClick(scriptureSection)}
        onDelete={() => onDeleteScriptureSection(scriptureSection, scriptureType)}>
      </Chip>
    </ListItem>
  }
  const handleSideBarClose = () => {
    local.setOpenSideBar(false)
  }
  return (
    <div className={styles.grid}>
      <List component="nav" aria-label="secondary reading scriptures">
        <ListItem button>
          <Button variant="contained" color="primary" onClick={onAddReadingScripturesClicked}>添加阅读经文</Button>
        </ListItem>
        {
          readingSentenceStore.scriptureSections &&
          readingSentenceStore.scriptureSections.map(scriptureSection =>
            renderScriptureSection(scriptureSection, ScriptureType.ReadingScripture))
        }
      </List>
      <List component="nav" aria-label="secondary preaching scriptures">
        <ListItem button>
          <Button variant="contained" color="primary" onClick={onAddPreachingScripturesClicked}>添加证道经文</Button>
        </ListItem>
        {
          preachingSentenceStore.scriptureSections &&
          preachingSentenceStore.scriptureSections.map(scriptureSection =>
            renderScriptureSection(scriptureSection, ScriptureType.PreachingScripture))
        }
      </List>
      <Dialog open={local.open} onClose={onClose}>
        <DialogContent>
          <BibleScripturesSelector onScritpuresSelected={onScripturesSelected} />
        </DialogContent>
      </Dialog>
      <Snackbar open={local.openSideBar} autoHideDuration={6000} onClose={handleSideBarClose}>
        <Alert onClose={handleSideBarClose} severity="info">
          {
            local.scriptureSection && local.scriptureSection.scriptures &&
            local.scriptureSection.scriptures.map(scripture => {
              return scripture.verses.map(verse => {
                return <Typography variant="h5" component="h5">
                  {verse}
                </Typography>
              })
            })
          }
        </Alert>
      </Snackbar>
    </div>
  )
})

export default Scriptures