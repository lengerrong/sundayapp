import React from 'react'
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import { observer } from 'mobx-react-lite'
import SongSelect from '../../components/song.selector'
import SongPanel from '../../components/song.panel'
import songsStore from '../../stores/songs.store'
import { Chip } from '@material-ui/core'
import LibraryMusicIcon from '@material-ui/icons/LibraryMusic'
import DragMoveDrop from '../../components/drag.move.drop'

const Songs = observer(({ styles }) => {
  const [currentSong, setCurrentSong] = React.useState({})
  const { songs } = songsStore
  const onSongSelect = (selectedSong, position) => {
    let newSongs = Array.from(songs)
    newSongs.push({ ...selectedSong, position })
    songsStore.setSongs(newSongs)
    setCurrentSong(selectedSong)
  }
  const getSongLable = (song) => {
    return (song.type == 0 ? '诗篇' : '圣诗') + song.index + ': 第' + song.verses.map(verse => verse.index).join(',') + '节'
  }
  const onSongClick = (song) => {
    console.log(song)
    if (song.index != currentSong.index ||
      song.position != currentSong.position ||
      song.title != currentSong.title ||
      JSON.stringify(song.verses) !== JSON.stringify(currentSong.verses)) {
      setCurrentSong(song)
    }
  }
  const onDeleteSong = (song) => {
    let newSongs = Array.from(songs)
    newSongs.splice(song.arrayIndex, 1)
    songsStore.setSongs(newSongs)
    setCurrentSong(newSongs.length >= 1 ? newSongs[0] : {})
  }
  const SongChip = (song) => {
    const songLabel = getSongLable(song)
    return (
      <Chip
        key={songLabel}
        className={styles.chip}
        clickable
        color="primary"
        icon={<LibraryMusicIcon />}
        label={songLabel}
        onClick={() => onSongClick(song)}
        onDelete={() => onDeleteSong(song)}
      />
    )
  }
  let displaySongs = Array.from(songs)
  displaySongs = displaySongs.map((song, index) => ({ ...song, arrayIndex: index }))
  return (
    <div className={styles.grid}>
      <ButtonGroup orientation="vertical" variant="text" color="primary" aria-label="vertical text primary button group">
        <DragMoveDrop>
          {displaySongs.filter((song) => song.position == 0).map(SongChip)}
        </DragMoveDrop>
        <SongSelect onSongSelect={(selectedSong) => onSongSelect(selectedSong, 0)} />
        <Button disabled>宣召</Button>
        <DragMoveDrop>
          {displaySongs.filter((song) => song.position == 1).map(SongChip)}
        </DragMoveDrop>
        <SongSelect onSongSelect={(selectedSong) => onSongSelect(selectedSong, 1)} />
        <Button disabled>宣读十诫</Button>
        <DragMoveDrop>
          {displaySongs.filter((song) => song.position == 2).map(SongChip)}
        </DragMoveDrop>
        <SongSelect onSongSelect={(selectedSong) => onSongSelect(selectedSong, 2)} />
        <Button disabled>证道</Button>
        <DragMoveDrop>
          {displaySongs.filter((song) => song.position == 3).map(SongChip)}
        </DragMoveDrop>
        <SongSelect onSongSelect={(selectedSong) => onSongSelect(selectedSong, 3)} />
      </ButtonGroup>
      <SongPanel song={currentSong} />
    </div>
  )
})

export default Songs