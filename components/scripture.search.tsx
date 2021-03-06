import React, { useEffect } from 'react'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import InputBase from '@material-ui/core/InputBase'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import SearchIcon from '@material-ui/icons/Search'
import PostAddIcon from '@material-ui/icons/PostAdd'
import { useLocalObservable, observer } from 'mobx-react-lite'
import { Grid, Popover } from '@material-ui/core'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            padding: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
        },
        input: {
            marginLeft: theme.spacing(1),
            flex: 1,
        },
        iconButton: {
            padding: 10,
        },
        divider: {
            height: 28,
            margin: 4,
        },
        popover: {
            margin: 4,
            padding: 4,
            color: 'purple'
        }
    }),
)

interface ScriptureSearchProps {
    search: string,
    onUseSearch: (scriptures: any, search: any) => void
}

const ScriptureSearch = observer(({ search, onUseSearch }: ScriptureSearchProps) => {
    const localSearch = useLocalObservable(() => ({
        text: search,
        scriptures: [],
        search: null,
        anchorEl: null,
        setText(text) {
            this.text = text
        },
        setScriptures(search, scriptures) {
            this.scriptures = scriptures
            this.search =search
        },
        setAnchorEl(el) {
            this.anchorEl = el
        }
    }))
    useEffect(
        () => {
            if (search) {
                onSearch(search)
            }
            localSearch.setAnchorEl(null)
        },
        [search]
    )

    const classes = useStyles()

    const onChange = (e) => {
        localSearch.setText(e.target.value)
        onSearch(e.target.value)
    }

    const onSearch = (search) => {
        fetch('/api/scriptures?search=' + search)
            .then(res => res.json())
            .then(scriptures => {
                localSearch.setScriptures(search, scriptures)
                onAddSearch()
            })
    }

    const onAddSearch = () => {
        const scripture = (localSearch.scriptures && localSearch.scriptures.length > 0)? localSearch.scriptures[0] : null
        const entries = scripture?Object.entries(scripture):[]
        if (entries && entries.length > 0 && entries[0][1]) {
            onUseSearch && onUseSearch(localSearch.scriptures, localSearch.search)
        }
    }
    const handleClick = (e) => {
        localSearch.setAnchorEl(e.currentTarget);
    };

    const handleClose = () => {
        localSearch.setAnchorEl(null);
    };

    const open = Boolean(localSearch.anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <Grid container direction='column' justifyContent='space-between' alignItems='center' >
            <Paper variant='outlined' className={classes.root}>
                <Popover
                    id={id}
                    open={open}
                    anchorEl={localSearch.anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                >
                    <Paper variant="outlined" square className={classes.popover}>
                        <h3>???????????????</h3>
                        <h4>????????????15:5</h4>
                        <h4>????????????15:5,7,9</h4>
                        <h4>????????????15:5-7;19:4-9</h4>
                        <h4>????????????15:5-7;19:4-9|????????????1:1</h4>
                    </Paper>
                </Popover>
                <IconButton color='primary' className={classes.iconButton} aria-label='tips' onClick={handleClick}>
                    <HelpOutlineIcon />
                </IconButton>
                <InputBase
                    className={classes.input}
                    onChange={onChange}
                    placeholder='????????????'
                    value={localSearch.text}
                    inputProps={{ 'aria-label': '????????????' }}
                />
                <IconButton onClick={() => onSearch(localSearch.text)} className={classes.iconButton} aria-label='search'>
                    <SearchIcon />
                </IconButton>
                <Divider className={classes.divider} orientation='vertical' />
                <IconButton onClick={onAddSearch} color='primary' className={classes.iconButton} aria-label='directions'>
                    <PostAddIcon />
                </IconButton>
            </Paper>
            <Grid container direction='column' justifyContent='center' alignItems='flex-start' >
                {localSearch.scriptures && localSearch.scriptures.map(
                    scripture => {
                        if (!scripture || !Object.entries(scripture) ||
                            Object.entries(scripture).length <= 0) {
                            return null
                        }
                        const key = Object.entries(scripture)[0][0]
                        const value:any[] = Object.entries(scripture)[0][1] as any[]
                        return (<>
                            {key && value && (value.length > 0) && <h2 key={key}>{key}</h2>}
                            {value && value.map(ss => ss.map(
                                s => {
                                    if (s.match(/^\d+/)) {
                                        return <p key={s}>{s}</p>
                                    }
                                    return <h3 key={s}>{s}</h3>
                                }
                            ))}
                        </>)
                    }
                )}
            </Grid>
        </Grid>
    )
})

export default ScriptureSearch
