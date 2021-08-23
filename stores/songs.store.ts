import { makeAutoObservable } from 'mobx'
import { Song } from '../common/song'

const songsStore = makeAutoObservable({
    songs: [] as Song[],
    setSongs(songs: Song[]) {
        this.songs = songs
    }
})

export default songsStore;
