import { makeAutoObservable } from 'mobx'

const songsStore = makeAutoObservable({
    songs: {},
    setSongs(songs) {
        this.songs = songs
    }
})

export default songsStore;
