export function getSongLable(song) {
    return (song.type == 0 ? '诗篇' : '圣诗') + song.index + ': 第' + song.verses.map(verse => verse.index).join(',') + '节'
}

export function getSongTitle(song) {
    return (song.type == 0 ? '诗篇' : '圣诗') + song.index
}

export function getSongVerseTitle(song, index) {
    if (song.verses[index].subtitle)
        return song.verses[index].subtitle
    return song.title ? song.title : ''
}

export function getSongVerse(song, index) {
    return song.verses[index].text
}

export function getSongVerseIndex(song, index) {
    return song.verses[index].index
}

export function staffArrangeTitle(arrangements) {
    let months = new Set(arrangements.map(arrange => arrange.riqi && Number(arrange.riqi.substring(5, 7))))
    return Array.from(months).join('、')
}

const romanMatrix = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I']
  ];
  
  export function convertToRoman(num) {
    if (num === 0) {
      return '';
    }
    for (var i = 0; i < romanMatrix.length; i++) {
      if (num >= romanMatrix[i][0]) {
        return romanMatrix[i][1] + convertToRoman(num - romanMatrix[i][0]);
      }
    }
  }