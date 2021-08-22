import { Scripture, ScriptureSection } from "../common/scritpure.section"

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

const romanMatrix: [number, string][]= [
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
  
  export function convertToRoman(num: number): string {
    if (num === 0) {
      return ''
    }
    for (let i = 0; i < romanMatrix.length; i++) {
      if (num >= romanMatrix[i][0]) {
        return romanMatrix[i][1] + convertToRoman(num - romanMatrix[i][0]);
      }
    }
    return ''
  }

  function indexsToString(indexs: number[]) {
    let result = null as unknown as string
    let stack = [] as number[]
    for (let index of indexs ) {
      if (stack.length == 0) {
        stack.push(index)
      } else if (stack.length == 1) {
        if (index == stack[0] + 1) {
          stack.push(index)
        } else {
          result = result ? result + ',' + stack[0] : '' + stack[0]
          stack[0] = index
        }
      } else {
        if (index == stack[1] + 1) {
          stack[1] = index
        } else {
          result = result ? result + ',' + stack[0] + '-' + stack[1] : stack[0] + '-' + stack[1]
          stack = [] as number[]
          stack.push(index)
        }
      }
    }
    if (stack.length == 1) {
      result = result ? result + ',' + stack[0] : '' + stack[0]
    } else if (stack.length == 2) {
      result = result ? result + ',' + stack[0] + '-' + stack[1] : stack[0] + '-' + stack[1]
    }
    return result ? result : ''
  }

  function getVersesIndexString(verses: string[]) {
    let indexs = verses.map(s => {
      let m = s.match(/^\d+/)
      if (m) {
        return Number(m[0])
      } else {
        return -1
      }
    }).filter(i => i != -1)
    return indexsToString(indexs)
  }

  export function getScriptureSectionSubTitle(ScriptureSection: ScriptureSection) {
    if (!ScriptureSection.scriptures) {
      return ''
    }
    return ScriptureSection.scriptures.map(s => {
      return s.chapterIndex.toString() + ':' + getVersesIndexString(s.verses)
    }).join(';')
  }

  export function getScriptureSectionTitle(ScriptureSection: ScriptureSection) {
    if (!ScriptureSection) {
      return null
    }
    return ScriptureSection.bookName + getScriptureSectionSubTitle(ScriptureSection)
  }

  export function getScriptureSectionsTitle(ScriptureSections: ScriptureSection[]) {
    if (!ScriptureSections) {
      return null
    }
    return ScriptureSections.map(getScriptureSectionTitle).join('|')
  }

  export function getScriptureSectionText(scritpure: Scripture) {
    if (!scritpure) {
      return null
    }
    return scritpure.verses.join('\n')
  }

  export function getScriptureSectionGoldenText(scritpure: Scripture) {
    if (!scritpure) {
      return ''
    }
    return scritpure.verses.map(v => v.replace(/^\d+/, '')).join('')
  }