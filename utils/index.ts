export function getSongLable(song) {
    return (song.type == 0 ? '诗篇' : '圣诗') + song.index + ': 第' + song.verses.map(verse => verse.index).join(',') + '节'
}