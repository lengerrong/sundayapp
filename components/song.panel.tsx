import React, { useEffect } from 'react'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { Divider, Grid, Button } from '@material-ui/core'
import { useLocalObservable, observer } from 'mobx-react-lite'
import NavigateBeforeRoundedIcon from '@material-ui/icons/NavigateBeforeRounded'
import NavigateNextRoundedIcon from '@material-ui/icons/NavigateNextRounded';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            display: 'flex',
            flexWrap: 'wrap',
            maxWidth: '70%',
            backgroundColor: 'black',
            color: 'white',
            padding: '0.2rem'
        },
        margin: {
            margin: theme.spacing(1),
        },
        formControl: {
            margin: theme.spacing(1),
            minWidth: 120,
        },
        divider: {
            width: '100%',
            border: '1px solid gray'
        },
        pre: {
            fontSize: '1.2rem'
        }
    }),
)

const SongPanel = observer(( {song} ) => {
    const classes = useStyles()
    const localSection = useLocalObservable(() => ({
        index: 0,
        setIndex(index) {
            this.index = index
        }
    }))
    useEffect(
        () => {
            localSection.setIndex(0)
        },
        [song]
    )
    if (JSON.stringify(song) === '{}') {
        return null;
    }
    const canNavNext = () => {
        return localSection.index < (song.verses.length - 1)
    }
    const canNavPrev = () => {
        return localSection.index > 0
    }
    const onNavSectionNext = () => {
        localSection.setIndex(localSection.index+1)
    }
    const onNavSectionPrev = () => {
        localSection.setIndex(localSection.index-1)
    }
    return (
        <div className={classes.container}>
            <Grid container direction='row' justifyContent='space-between' alignItems='center'>
                <h1>{(song.type == 0 ? '诗篇' : '圣诗') + song.index}</h1>
                <h2>{song.verses[localSection.index].subtitle || song.title}</h2>
                <h3>{song.verses[localSection.index].index}</h3>
            </Grid>
            <Divider className={classes.divider}/>
            <Grid container direction='row' justifyContent='center' alignItems='center'>
                <pre className={classes.pre}>{song.verses[localSection.index].text}</pre>
            </Grid>
            <Grid container direction='row' justifyContent='flex-end' alignItems='center'>
                {canNavPrev() && <Button onClick={onNavSectionPrev} ><NavigateBeforeRoundedIcon color='primary' fontSize='large' /></Button>}
                {canNavNext() && <Button onClick={onNavSectionNext} ><NavigateNextRoundedIcon color='primary' fontSize='large' /></Button>}
            </Grid>
        </div>
    )
})

export default SongPanel;