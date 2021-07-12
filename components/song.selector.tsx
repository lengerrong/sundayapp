import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const psalms = require('../jsons/psalms')
const hymns = require('../jsons/hymns')
const songs = [psalms, hymns]

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        margin: {
            margin: theme.spacing(1),
        },
        formControl: {
            margin: theme.spacing(1),
            minWidth: 120,
        },
    }),
);

const defaultType = 1;
const defaultIndex = 1;
const defaultSections = [];

export default function SongSelect({onSongSelect}) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const [type, setType] = React.useState<number | string>(defaultType);
    const [index, setIndex] = React.useState<number | string>(defaultIndex);
    const [sections, setSections] = React.useState<[number]>(defaultSections);
    const maxIndex = type == defaultType ? psalms.length : hymns.length;
    const songIndexLabel = '第' + index + '首';
    const sectionsLabel = '第' + sections + '节';
    const song = songs[type-1][index-1];

    const onTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setType(Number(event.target.value) || '');
        if (event.target.value == 1 && index > hymns.length) {
            setIndex(1)
        }
    };

    const onIndexChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        let indexValue = Number(event.target.value) || 1;
        if (indexValue < 1) {
            indexValue = 1;
        }
        if (indexValue > maxIndex) {
            indexValue = maxIndex;
        }
        setIndex(indexValue);
        setSections(defaultSections);
    };

    const onSectionsChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSections(event.target.value);
    }

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        cleanState();
    };

    const handleOk = () => {
        if (sections.length < 1) {
            return;
        }
        onSongSelect && onSongSelect({type: type-1, index: index-1, sections});
        cleanState();
    };

    const cleanState = () => {
        setOpen(false);
        setIndex(defaultIndex);
        setType(defaultType);
        setSections(defaultSections);
    }

    return (
        <div>
            <Fab size='small' color="secondary" aria-label="add" className={classes.margin} onClick={handleClickOpen}>
                <AddIcon />
            </Fab>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>选择诗歌</DialogTitle>
                <DialogContent>
                    <form className={classes.container}>
                        <FormControl className={classes.formControl}>
                            <InputLabel id="song-type-selector-label">赞美诗</InputLabel>
                            <Select
                                value={type}
                                labelId='song-type-selector-label'
                                onChange={onTypeChange} >
                                <MenuItem value={1}>诗篇</MenuItem>
                                <MenuItem value={2}>圣诗</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl className={classes.formControl}>
                            <TextField
                                id="song-index-number"
                                label={songIndexLabel}
                                type="number"
                                value={index}
                                onChange={onIndexChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                InputProps={{
                                    inputProps: {
                                        max: maxIndex,
                                        min: 1
                                    }
                                }}
                            />
                        </FormControl>
                        <FormControl className={classes.formControl} error={sections.length < 1}>
                            <InputLabel id="song-sections-selector-label">{sectionsLabel}</InputLabel>
                            <Select
                                value={sections}
                                multiple
                                labelId='song-sections-selector-label'
                                onChange={onSectionsChange} >
                                {song.verses.map((verse) => (
                                    <MenuItem key={verse.index} value={Number(verse.index)}>{verse.index}</MenuItem>
                                ))}
                            </Select>
                            {sections.length < 1 && <FormHelperText>请至少选择一节歌</FormHelperText>}
                        </FormControl>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        取消
          </Button>
                    <Button onClick={handleOk} color="primary">
                        确定
          </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
