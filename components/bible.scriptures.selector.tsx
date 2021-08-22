import React from 'react'
import { useLocalObservable, observer } from 'mobx-react-lite'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import { List, ListItem } from '@material-ui/core'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import Checkbox from '@material-ui/core/Checkbox'
import { Book } from '../common/book'
import BibleVolumeChapterSelector from './bible.volume.chatper.selector'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        selectingRoot: {
            borderRadius: '4px',
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            border: 0,
            color: 'white',
            boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        },
        scripture: {
            color: 'indigo'
        }
    }),
)

interface BookProps {
    book: Book,
    onScritpuresSelected: (book: Book, verses: string[]) => void,
    verses: string[]
}

const VersesSelector = observer(({ book, onScritpuresSelected, verses }: BookProps) => {
    const classes = useStyles()
    const local = useLocalObservable(() => ({
        checked: [] as number[],
        setChecked(checked: number[]) {
            this.checked = checked
        }
    }))
    const handleToggle = (index: number) => {
        const currentIndex = local.checked.indexOf(index)
        const newChecked = [...local.checked]
        if (currentIndex === -1) {
            newChecked.push(index)
        } else {
            newChecked.splice(currentIndex, 1)
        }
        local.setChecked(newChecked)
    }
    const onOk = () => {
        let selected = Array.from(local.checked)
        selected.sort((a, b) => a - b)
        let selected_verses = selected.map(index => verses[index])
        if (selected_verses.length <= 0) {
            alert('请至少选择一节经文!')
            return
        }
        onScritpuresSelected && onScritpuresSelected(book, selected_verses)
    }
    const onCancel = () => {
        local.setChecked([])
        onScritpuresSelected && onScritpuresSelected(book, [])
    }
    const getLabelId = (index: number) => ('checkbok-lablel-' + index)
    return <>
        <List component="nav" aria-label="secondary selecting-scriptures" className={classes.selectingRoot}>
            <ListItem>
                <ListItemText id="switch-list-label-selecting" primary="选择经文" />
                <ListItemSecondaryAction>
                    <Button variant="contained" color="secondary" onClick={onOk}>确定</Button>
                    <Button variant="contained" onClick={onCancel}>取消</Button>
                </ListItemSecondaryAction>
            </ListItem>
        </List>
        <List component="nav" aria-label="secondary scriptures">
            {verses.map((verse, index) => <ListItem key={verse} button onClick={() => handleToggle(index)}>
                <ListItemText id={getLabelId(index)} primary={verse} classes={{
                    primary: classes.scripture
                }}/>
                <ListItemSecondaryAction>
                    <Checkbox
                        edge="end"
                        onChange={() => handleToggle(index)}
                        checked={local.checked.indexOf(index) !== -1}
                        inputProps={{ 'aria-labelledby': getLabelId(index) }}
                    />
                </ListItemSecondaryAction>
            </ListItem>)}
        </List>
    </>
})

interface BibleScripturesSelectorProps {
    onScritpuresSelected: (book: Book, verses: string[]) => void
}

const BibleScripturesSelector = observer(({ onScritpuresSelected }: BibleScripturesSelectorProps) => {
    const classes = useStyles()
    const local = useLocalObservable(() => ({
        book: null as unknown as Book, // grid view
        verses: null as unknown as string[],
        setBook(book: Book) {
            this.book = book
        },
        setVerses(verses: string[]) {
            this.verses = verses
        }
    }))
    const onVolumeChapterSelected = async (book: Book) => {
        let scriptures = await fetch('/api/scriptures?search=' + book.bookName + book.bookChapterIndex)
                .then(res => res.json())
        let chapter = scriptures[0]
        local.setVerses(chapter[chapter.search][0])
        local.setBook(book)
    }
    return <div className={classes.root}>
        {local.book === null && <BibleVolumeChapterSelector
            onVolumeChapterSelected={onVolumeChapterSelected}></BibleVolumeChapterSelector>}
        {local.book && <VersesSelector book={local.book} verses={local.verses}
            onScritpuresSelected={onScritpuresSelected} ></VersesSelector>}
    </div>
})

export default BibleScripturesSelector