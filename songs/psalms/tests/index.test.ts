import psalms from '../'
import psalmsTxt from '../psalms.txt'

const toTxt = (psalm: typeof psalms[0]) => {
  return `诗篇${psalm.index} ${psalm.title}

${psalm.verses.reduce((vt, verse) => {
    let v = `${verse.index}.
${verse.text}
`
    return vt + v
  }, '')}
`
}

describe('psalms', () => {
  it('validate psalms against psalms.txt', () => {
    const psalmsPlainText = psalms.reduce((txt, psalm) => {
      txt += toTxt(psalm)
      return txt
    }, "")
    expect(psalmsPlainText).toEqual(psalmsTxt)
  })
})