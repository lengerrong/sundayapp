// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const PPTX = require('er-nodejs-pptx')
const fs = require('fs')
const util = require('util')
const xml2js = require('xml2js')
import { staffArrangeTitle, convertToRoman, getSongTitle, getSongVerseTitle, getSongVerse, getSongVerseIndex, getScriptureSectionSubTitle, getScriptureSectionGoldenText, getScriptureSectionsTitle, getChunksPath } from '../../utils'
import { ScriptureSection } from '../../common/scritpure.section'
//console.log(util.inspect(result, false, null))

const songlinexml = '<a:p><a:pPr marL="0" marR="0" lvl="0" indent="0" algn="ctr" rtl="0"><a:spcBef><a:spcPts val="0"/></a:spcBef><a:spcAft><a:spcPts val="0"/></a:spcAft><a:buNone/></a:pPr><a:r><a:rPr lang="en" b="0" i="0" u="none" sz="2800" strike="noStrike" cap="none"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:latin typeface="Calibri"/><a:ea typeface="Calibri"/><a:cs typeface="Calibri"/><a:sym typeface="Calibri"/></a:rPr><a:t>placeholder</a:t></a:r><a:endParaRPr/></a:p>'
const reportlinexml = '<a:p><a:pPr marL="0" indent="0"><a:buNone/></a:pPr><a:r><a:rPr lang="ja-JP" altLang="en-US" sz="2600"/><a:t>placeholder</a:t></a:r></a:p>'

function unlinkCallback(err) {
  if (err) {
    console.error(err)
  }
}

function errEnd(res, err, tmpPath) {
  fs.unlink(tmpPath, unlinkCallback)
  res.end(err)
}

function finishEnd(res, tmpPath) {
  fs.unlink(tmpPath, unlinkCallback)
  res.end()
}

function updateSlideContent(pres, slide, content) {
  slide.content = JSON.parse(content)
  let slideKey = `ppt/slides/${slide.name}.xml`
  pres.content[slideKey] = slide.content
}

async function pushparagrahtoslide(slide, lines, pspindex, pxml) {
  let parser = new xml2js.Parser()
  slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][pspindex]['p:txBody'][0]['a:p'] = []
  for (let line of lines) {
    let linexml = pxml.replace('placeholder', line)
    let pxmljs = await parser.parseStringPromise(linexml)
    slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][pspindex]['p:txBody'][0]['a:p'].push(pxmljs['a:p'])
  }
}

const REPORT_LINES_PER_SLIDE: number = 7

async function updateReports(pres, reports, reportSlideNumber) {
  let slide = await pres.getSlide(reportSlideNumber)
  reports = reports.trim()
  let lines = reports.split('\n')
  let count = Math.ceil(lines.length / REPORT_LINES_PER_SLIDE)
  let pages:any[] = []
  for (let i = 0; i < count; i++) {
    pages.push(lines.slice(i * REPORT_LINES_PER_SLIDE, (i + 1) * REPORT_LINES_PER_SLIDE))
  }
  console.log(pages)
  let ocontent = JSON.stringify(slide.content)
  await pushparagrahtoslide(slide, pages[0], 1, reportlinexml)
  slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][2]['p:txBody'][0]['a:p'][0]['a:r'][0]['a:t'] = ['1 / ' + count]
  let slideKey = `ppt/slides/${slide.name}.xml`
  pres.content[slideKey] = slide.content

  for (let ii = 1; ii < count; ii++) {
    await pres.addSlide(async slideii => {
      slideii.content = JSON.parse(ocontent)
      await pushparagrahtoslide(slideii, pages[ii], 1, reportlinexml)
      slideii.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][2]['p:txBody'][0]['a:p'][0]['a:r'][0]['a:t'] = [(1 + ii) + ' / ' + count]
      let slideiiKey = `ppt/slides/${slideii.name}.xml`
      pres.content[slideiiKey] = slideii.content
      slideii.moveTo(ii + reportSlideNumber)
    }, 'slideLayout16')
  }
  return count - 1
}

async function updateGoldenSentence(pres, goldensentence: ScriptureSection) {
  let goldenSentenceSlide = await pres.getSlide(10)
  let content = JSON.stringify(goldenSentenceSlide.content)
  const text = getScriptureSectionGoldenText(goldensentence.scriptures[0])
  content = content.replace('我是葡萄树，你们是枝子。住在我里面的，我也住在他里面，他就结出很多果子；因为离开了我，你们就不能作甚么。', text)
  content = content.replace('约翰福音', goldensentence.bookName)
  content = content.replace('15:5', getScriptureSectionSubTitle(goldensentence))
  updateSlideContent(pres, goldenSentenceSlide, content)
}

async function updateStaffArrangements(pres, arrangements) {
  let staffSlide = await pres.getSlide(11)
  let content = JSON.stringify(staffSlide.content)
  content = content.replace('month', staffArrangeTitle(arrangements))
  arrangements = arrangements.map(arrange => {
    arrange.riqi = parseInt(arrange.riqi.substring(8)).toString() + '日'
    arrange.sishi = arrange.sishi.split(' ').map(s => s.padEnd(8, ' ')).join(' ')
    return arrange
  })
  let placeholders = [
    ['ls日', 'lsdailing', 'lssishi', 'lssiqing', 'lsbabysitter', 'lsxiaozhushou'],
    ['ts日', 'tsdailing', 'tssishi', 'tssiqing', 'tsbabysitter', 'tsxiaozhushou'],
    ['ns日', 'nsdailing', 'nssishi', 'nssiqing', 'nsbabysitter', 'nsxiaozhushou'],
    ['nns日', 'nnsdailing', 'nnssishi', 'nnssiqing', 'nnsbabysitter', 'nnsxiaozhushou'],
  ]
  let keyholders = ['riqi', 'dailing', 'sishi', 'siqing', 'babysitter', 'xiaozhushou']
  for (let i = 0; i < placeholders.length; i++) {
    for (let j = 0; j < keyholders.length; j++) {
      content = content.replace(placeholders[i][j], arrangements[i][keyholders[j]])
    }
  }
  updateSlideContent(pres, staffSlide, content)
}

async function updatePreachingArticle(pres, preachingArticle) {
  let slide = await pres.getSlide(17)
  let lines = preachingArticle.split('\n').filter(s => s && !/^\s*$/.test(s)).map(s => {
    let i = s.indexOf('.')
    if (i == -1) {
      i = s.indexOf('。')
    }
    if (i != -1) {
      s = s.substring(i + 1)
    }
    s = s.trim()
    return s
  })

  console.log(preachingArticle, lines)

  if (lines.length >= 1) {
    slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][1]['p:txBody'][0]['a:p'][0]['a:r'][0]['a:t'] = [lines[0]]
    if (lines.length >= 2) {
      slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][1]['p:txBody'][0]['a:p'][1]['a:r'][1]['a:t'] = [lines[1]]
    }
    if (lines.length >= 3) {
      slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][1]['p:txBody'][0]['a:p'][2]['a:r'][1]['a:t'] = [lines[2]]
    }
    for (let i = 3; i < lines.length; i++) {
      slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][1]['p:txBody'][0]['a:p'].push(JSON.parse(JSON.stringify(slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][1]['p:txBody'][0]['a:p'][i - 1])));
      slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][1]['p:txBody'][0]['a:p'][i]['a:r'][0]['a:t'] = [convertToRoman(i) + '. ']
      slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][1]['p:txBody'][0]['a:p'][i]['a:r'][1]['a:t'] = [lines[i]]
    }
    let slideKey = `ppt/slides/${slide.name}.xml`
    pres.content[slideKey] = slide.content
  }
}


function getSongPosition(song) {
  let postions = [3, 4, 10, 14, 18]
  return postions[song.position]
}

async function insertSong(pres, song, template) {
  song.verses.reverse()
  for (let index in song.verses) {
    await pres.addSlide(async slide => {
      slide.content = JSON.parse(template)
      slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][0]['p:txBody'][0]['a:p'][0]['a:r'][0]['a:t'] = [getSongTitle(song)]
      slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][1]['p:txBody'][0]['a:p'][0]['a:r'][0]['a:t'] = [getSongVerseTitle(song, index)]
      slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][2]['p:txBody'][0]['a:p'][0]['a:r'][0]['a:t'] = [getSongVerseIndex(song, index)]
      await pushparagrahtoslide(slide, getSongVerse(song, index).split('\r\n'), 3, songlinexml)
      let slideKey = `ppt/slides/${slide.name}.xml`
      pres.content[slideKey] = slide.content
      slide.moveTo(getSongPosition(song))
    }, 'slideLayout1')
  }
}

async function insertSongs(pres, songs) {
  console.log(util.inspect(songs, false, null))
  let sanyisong = await pres.getSlide(19)
  sanyisong = JSON.stringify(sanyisong.content)
  for (let song of songs) {
    await insertSong(pres, song, sanyisong)
  }
}

const SCRIPTURE_LINES_PER_SLIDE: number = 15

const readingTitleScritureXml = '<a:p><a:pPr marL="0" lvl="0" indent="0" algn="l" rtl="0"><a:lnSpc><a:spcPct val="115000"/></a:lnSpc><a:spcBef><a:spcPts val="1200"/></a:spcBef><a:spcAft><a:spcPts val="0"/></a:spcAft><a:buClr><a:schemeClr val="dk1"/></a:buClr><a:buSzPts val="1100"/><a:buFont typeface="Arial"/><a:buNone/></a:pPr><a:r><a:rPr lang="zh-CN" altLang="en-US" sz="3200" baseline="30000" dirty="0"/><a:t>placeholder</a:t></a:r></a:p>'
const readingScripturesXml = '<a:p><a:r><a:rPr lang="en-US" altLang="zh-CN" sz="1800" baseline="30000" dirty="0"/><a:t>placeholder1</a:t></a:r><a:r><a:rPr lang="zh-CN" altLang="en-US" sz="1800" dirty="0"/><a:t>placeholder2</a:t></a:r></a:p>'
const preachingTitleScritureXml = '<a:p><a:pPr marL="0" lvl="0" indent="0" algn="l" rtl="0"><a:lnSpc><a:spcPct val="115000"/></a:lnSpc><a:spcBef><a:spcPts val="1200"/></a:spcBef><a:spcAft><a:spcPts val="0"/></a:spcAft><a:buClr><a:schemeClr val="dk1"/></a:buClr><a:buSzPts val="1100"/><a:buFont typeface="Arial"/><a:buNone/></a:pPr><a:r><a:rPr lang="zh-CN" altLang="en-US" sz="3200" baseline="30000" dirty="0"><a:solidFill><a:srgbClr val="FFFF00"/></a:solidFill></a:rPr><a:t>placeholder</a:t></a:r></a:p>'
const preachingScripturesXml = '<a:p><a:r><a:rPr lang="en-US" altLang="zh-CN" sz="1800" baseline="30000" dirty="0"><a:solidFill><a:srgbClr val="FFFF00"/></a:solidFill></a:rPr><a:t>placeholder1</a:t></a:r><a:r><a:rPr lang="zh-CN" altLang="en-US" sz="1800" dirty="0"><a:solidFill><a:srgbClr val="FFFF00"/></a:solidFill></a:rPr><a:t>placeholder2</a:t></a:r></a:p>'
const scripturesPXml = '<a:p><a:pPr marL="0" lvl="0" indent="0" algn="l" rtl="0"><a:lnSpc><a:spcPct val="115000"/></a:lnSpc><a:spcBef><a:spcPts val="1200"/></a:spcBef><a:spcAft><a:spcPts val="0"/></a:spcAft><a:buClr><a:schemeClr val="dk1"/></a:buClr><a:buSzPts val="1100"/><a:buFont typeface="Arial"/><a:buNone/></a:pPr></a:p>'
async function pushscritpurestoslide(slide, lines, pspindex, titleScritureXml, scripturesXml) {
  let parser = new xml2js.Parser()
  slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][pspindex]['p:txBody'][0]['a:p'] = []
  let lastP = {}
  for (let line of lines) {
    let m = line.match(/^(\d+)(.*)/)
    let linexml = ''
    if (m) {
      linexml = scripturesXml.replace('placeholder1', m[1])
      linexml = linexml.replace('placeholder2', m[2])
    } else {
      linexml = titleScritureXml.replace('placeholder', line)
      lastP = {}
    }
    let pxmljs = await parser.parseStringPromise(linexml)
    if (m) {
      if (JSON.stringify(lastP) === '{}') {
        lastP = await parser.parseStringPromise(scripturesPXml)
        lastP['a:p']['a:r'] = []
        slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][pspindex]['p:txBody'][0]['a:p'].push(lastP['a:p'])
      }
      lastP['a:p']['a:r'].push(pxmljs['a:p']['a:r'][0])
      lastP['a:p']['a:r'].push(pxmljs['a:p']['a:r'][1])
    } else {
      slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][pspindex]['p:txBody'][0]['a:p'].push(pxmljs['a:p'])
    }
  }
}

async function insertScripturesHelper(pres, scritpureSections: ScriptureSection[], baseSlideNumber: number, pxml: string, axml: string) {
  let slide = await pres.getSlide(baseSlideNumber)
  let allline: string = scritpureSections.map((scritpureSection: ScriptureSection) => scritpureSection.scriptures
    .map(scripture => scripture.verses.join('\n'))).join('\n')
  let lines = allline.split('\n')
  let count = Math.ceil(lines.length / SCRIPTURE_LINES_PER_SLIDE)
  let pages:any[] = []
  for (let i = 0; i < count; i++) {
    pages.push(lines.slice(i * REPORT_LINES_PER_SLIDE, (i + 1) * REPORT_LINES_PER_SLIDE))
  }
  console.log(pages)
  let ocontent = JSON.stringify(slide.content)
  let scriptureSectionsTitle = getScriptureSectionsTitle(scritpureSections)
  await pushscritpurestoslide(slide, pages[0], 1, pxml, axml)
  slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][2]['p:txBody'][0]['a:p'][0]['a:r'][0]['a:t'] = ['1 / ' + count]
  slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][0]['p:txBody'][0]['a:p'][0]['a:r'][1]['a:t'] = [ scriptureSectionsTitle ]
  let slideKey = `ppt/slides/${slide.name}.xml`
  pres.content[slideKey] = slide.content

  for (let ii = 1; ii < count; ii++) {
    await pres.addSlide(async slideii => {
      slideii.content = JSON.parse(ocontent)
      await pushscritpurestoslide(slideii, pages[ii], 1, pxml, axml)
      slideii.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][2]['p:txBody'][0]['a:p'][0]['a:r'][0]['a:t'] = [(1 + ii) + ' / ' + count]
      slideii.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][0]['p:txBody'][0]['a:p'][0]['a:r'][1]['a:t'] = [ scriptureSectionsTitle ]
      let slideiiKey = `ppt/slides/${slideii.name}.xml`
      pres.content[slideiiKey] = slideii.content
      slideii.moveTo(ii + baseSlideNumber)
    }, 'slideLayout27')
  }
  return count - 1
}

async function insertScriptures(pres, readingScriptures: ScriptureSection[], preachingScriptures: ScriptureSection[], newaddedslides: number) {
  let newaddedscriptures = await insertScripturesHelper(pres, readingScriptures, 15 + newaddedslides, readingTitleScritureXml, readingScripturesXml)
  newaddedscriptures = newaddedscriptures + await insertScripturesHelper(pres, preachingScriptures, 16 + newaddedslides + newaddedscriptures, preachingTitleScritureXml, preachingScripturesXml)
  return newaddedscriptures
}

export default async function handler(req, res) {
  console.log(req.body)
  const tmpPPTX = '/tmp/worship' + Math.random() + '.pptx'
  try {
    let pptx = new PPTX.Composer()
    await pptx.load(__dirname +  getChunksPath() + 'templates/worship.pptx')
    await pptx.compose(async pres => {
      await updateGoldenSentence(pres, req.body.goldensentence)
      await updateStaffArrangements(pres, req.body.staffArranges)
      await updatePreachingArticle(pres, req.body.preachingArticle)
      await insertSongs(pres, req.body.songs.reverse())
      let newslidesbysongsbeforereports = req.body.songs.filter(song => song.position <= 2)
        .map(song => song.verses.length).reduce((accumulator, currentValue) => accumulator + currentValue)
      let newaddedreports = await updateReports(pres, req.body.reports, 12 + newslidesbysongsbeforereports)
      let newslidesbysongsbeforesanyisong = req.body.songs.filter(song => song.position <= 3)
        .map(song => song.verses.length).reduce((accumulator, currentValue) => accumulator + currentValue)
      await insertScriptures(pres, req.body.readingScriptures, req.body.preachingScriptures, newaddedreports + newslidesbysongsbeforesanyisong)
    })
    await pptx.save(tmpPPTX)
  } catch (e) {
    console.error(e)
    res.status(500).json({ 'stack': e.stack, 'reqbody': JSON.stringify(req.body) })
    return
  }
  res.writeHead(200, {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  })
  let rs = fs.createReadStream(tmpPPTX)
  rs.on('error', (err) => errEnd(res, err, tmpPPTX))
  rs.on('finish', () => finishEnd(res, tmpPPTX))
  res.on('error', (err) => errEnd(res, err, tmpPPTX))
  res.on('finish', () => finishEnd(res, tmpPPTX))
  rs.pipe(res)
}
