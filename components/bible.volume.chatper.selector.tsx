import React from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Slide from '@material-ui/core/Slide';
import { useLocalObservable, observer } from 'mobx-react-lite'
import { Book } from '../common/book'
import { CardContent, Typography, Card } from '@material-ui/core'

const cnvs = require('../pages/api/scriptures/cnvs/bible.json')

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1
        },
        volumnCard: {
            border: 'thick double #32a1ce',
            minWidth: '100px',
            minHeight: '120px'
        },
        chapterCard: {
            border: 'thick double #32a1ce',
            minWidth: '40px',
            minHeight: '40px'
        },
        focusVolumnCard: {
            border: 'thick double red',
            color: 'red',
            minWidth: '100px',
            minHeight: '120px'
        }
    }),
)

enum ViewType {
    GRID,
    LIST
}

enum ContentType {
    VOLUMN,
    CHAPTER
}

interface VolumnsProps {
    currentBook: Book,
    onVolumnClick: (book: Book) => void
}

function Volumns({ currentBook, onVolumnClick }: VolumnsProps) {
    const classes = useStyles()

    const renderBookList = (booksList: Book[]) => {
        return <>
            {
                booksList.map((book: Book) => {
                    return <Grid key={book.bookName} item xs={3} onClick={() => onVolumnClick(book)}>
                        <Card className={(book.bookName === currentBook.bookName ? classes.focusVolumnCard : classes.volumnCard)}>
                            <CardContent>
                                <Typography>
                                    {book.bookAbbrName}
                                </Typography>
                                <Typography>
                                    {book.bookName}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                })
            }
        </>

    }

    console.log(cnvs.data[0].booksList)
    console.log(cnvs.data[1].booksList)
    return <>
        <Typography variant="h3" component="h3">
            旧约
        </Typography>
        <Grid container>
            {renderBookList(cnvs.data[0].booksList)}
        </Grid>
        <Typography variant="h3" component="h3">
            新约
        </Typography>
        <Grid container>
            {renderBookList(cnvs.data[1].booksList)}
        </Grid>
    </>
}

const range = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + (i * step))

interface ChaptersProps {
    book: Book,
    onChapterClick: (index: number) => void
}

function Chapters({ book, onChapterClick }: ChaptersProps) {
    const classes = useStyles()
    return <Grid container>
        {range(1, book.bookChapterMaxNumber, 1).map(index => {
            return <Grid item xs={2} onClick={() => onChapterClick(index)}>
                <Card className={classes.chapterCard}>
                    <CardContent>
                        <Typography>{index}</Typography>
                    </CardContent>
                </Card>
            </Grid>
        })}
    </Grid>
}

const genBook = {
    "versionCode": "cnvs",
    "bookId": 1,
    "bookUsfm": "GEN",
    "canon": "ot",
    "bookName": "创世记",
    "bookAbbrName": "创",
    "bookChapterMaxNumber": 50,
    "versesCount": 0
}

interface BibleVolumeChapterSelectorProps {
    onVolumeChapterSelected: (book: Book) => void
}

const BibleVolumeChapterSelector = observer(({ onVolumeChapterSelected }: BibleVolumeChapterSelectorProps) => {
    const classes = useStyles()
    const local = useLocalObservable(() => ({
        viewType: ViewType.GRID, // grid view
        contentType: ContentType.VOLUMN,
        book: genBook,
        setViewType(viewType: ViewType) {
            this.viewType = viewType
        },
        setContentType(contentType: ContentType) {
            this.contentType = contentType
        },
        setBook(book: Book) {
            this.book = book
        }
    }))
    const onVolumnClicked = () => {
        local.setContentType(ContentType.VOLUMN)
    }
    const onChapterClicked = () => {
        local.setContentType(ContentType.CHAPTER)
    }
    const getTitle = () => {
        if (local.contentType === ContentType.CHAPTER) {
            return local.book.bookName
        } else {
            return '圣经目录'
        }
    }
    const onChapterClick = (bookChapterIndex: number) => {
        console.log(onVolumeChapterSelected)
        onVolumeChapterSelected && onVolumeChapterSelected({ ...local.book, bookChapterIndex })
    }
    const onVolumnClick = (book: Book) => {
        local.setBook(book)
        local.setContentType(ContentType.CHAPTER)
    }
    return <div className={classes.root}>
        <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
        >
            {getTitle()}
        </Grid>
        <Grid
            container
            direction="row"
            justifyContent="space-between"
            alignItems="center"
        >
            <Button variant="contained"
                color={local.contentType === ContentType.VOLUMN ? "secondary" : "default"}
                onClick={onVolumnClicked}
            >卷</Button>
            <Button variant="contained"
                color={local.contentType === ContentType.CHAPTER ? "secondary" : "default"}
                onClick={onChapterClicked}
            >章</Button>
        </Grid>
        <Slide direction="left" in={local.contentType === ContentType.VOLUMN} mountOnEnter unmountOnExit>
            <Paper>
                <Volumns currentBook={local.book} onVolumnClick={onVolumnClick}></Volumns>
            </Paper>

        </Slide>
        <Slide direction="right" in={local.contentType === ContentType.CHAPTER} mountOnEnter unmountOnExit>
            <Paper>
                <Chapters book={local.book} onChapterClick={onChapterClick}></Chapters>
            </Paper>
        </Slide>
    </div>
})

export default BibleVolumeChapterSelector