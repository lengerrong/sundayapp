export function getSongLable(song) {
    return (song.type == 0 ? '诗篇' : '圣诗') + song.index + ': 第' + song.verses.map(verse => verse.index).join(',') + '节'
}

export function staffArrangeTitle(arrangements) {
    let months = new Set(arrangements.map(arrange => arrange.riqi && Number(arrange.riqi.substring(5, 7))))
    return Array.from(months).join('、')
}