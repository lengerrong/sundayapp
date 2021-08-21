import React, { useEffect } from 'react'
import { useLocalObservable, observer } from 'mobx-react-lite'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import { List, ListItem, Switch, ListItemAvatar } from '@material-ui/core'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import Checkbox from '@material-ui/core/Checkbox'
import { Book } from './book'
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
    onScritpuresSelected: (book: Book, verses: string[]) => void
}

const VersesSelector = observer(({ book, onScritpuresSelected }: BookProps) => {
    const classes = useStyles()
    const local = useLocalObservable(() => ({
        verses: [] as string[],
        checked: [] as number[],
        selecting: false,
        setVerses(verses: string[]) {
            this.verses = verses
        },
        setChecked(checked: number[]) {
            this.checked = checked
        },
        setSelecting(selecting: boolean) {
            this.selecting = selecting
        }
    }))
    useEffect(
        () => {
            fetch('/api/scriptures?search=' + book.bookName + book.bookChapterIndex)
                .then(res => res.json())
                .then(scriptures => {
                    let chapter = scriptures[0]
                    local.setVerses(chapter[chapter.search][0])
                })
        },
        [book]
    )
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
    const onSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        local.setSelecting(e.target.checked)
    }
    const onOk = () => {
        console.log('selected ', local.checked.map(index => local.verses[index]),
            ' from ', book.bookName, ' chapter ', book.bookChapterIndex)
        onScritpuresSelected && onScritpuresSelected(book, local.checked.map(index => local.verses[index]))
    }
    const onCancel = () => {
        local.setChecked([])
        local.setSelecting(false)
    }
    const getLabelId = (index: number) => ('checkbok-lablel-' + index)
    return <>
        <List component="nav" aria-label="secondary selecting-scriptures" className={classes.selectingRoot}>
            <ListItem>
                <ListItemAvatar>
                    <Switch
                        edge="start"
                        onChange={onSwitchChange}
                        checked={local.selecting}
                        inputProps={{ 'aria-labelledby': 'switch-list-label-selecting' }}
                    />
                </ListItemAvatar>
                <ListItemText id="switch-list-label-selecting" primary="选择经文" />
                {local.selecting &&
                    <ListItemSecondaryAction>
                        <Button variant="contained" color="secondary" onClick={onOk}>确定</Button>
                        <Button variant="contained" onClick={onCancel}>取消</Button>
                    </ListItemSecondaryAction>
                }
            </ListItem>
        </List>
        <List component="nav" aria-label="secondary scriptures">
            {local.verses.map((verse, index) => <ListItem key={verse} button>
                <ListItemText id={getLabelId(index)} primary={verse} classes={{
                    primary: classes.scripture
                }}/>
                {local.selecting &&
                    <ListItemSecondaryAction>
                        <Checkbox
                            edge="end"
                            onChange={() => handleToggle(index)}
                            checked={local.checked.indexOf(index) !== -1}
                            inputProps={{ 'aria-labelledby': getLabelId(index) }}
                        />
                    </ListItemSecondaryAction>
                }
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
        setBook(book: Book) {
            this.book = book
        }
    }))
    const onVolumeChapterSelected = (book: Book) => {
        local.setBook(book)
    }
    return <div className={classes.root}>
        {local.book === null && <BibleVolumeChapterSelector
            onVolumeChapterSelected={onVolumeChapterSelected}></BibleVolumeChapterSelector>}
        {local.book && <VersesSelector book={local.book}
            onScritpuresSelected={onScritpuresSelected} ></VersesSelector>}
    </div>
})

export default BibleScripturesSelector