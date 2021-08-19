// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const PPTX = require('nodejs-pptx')
const fs = require('fs')
const util = require('util')
const xml2js = require('xml2js')
import { staffArrangeTitle, convertToRoman } from '../../utils'
//console.log(util.inspect(result, false, null))

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

async function pushparagrahtoslide(slide, lines) {
  let pxml = '<a:p><a:pPr marL="0" indent="0"><a:buNone/></a:pPr><a:r><a:rPr lang="ja-JP" altLang="en-US" sz="2800"/><a:t>placeholder</a:t></a:r></a:p>'
  let parser = new xml2js.Parser()
  slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][1]['p:txBody'][0]['a:p'] = []
  for (let line of lines) {
    let linexml = pxml.replace('placeholder', line)
    let pxmljs = await parser.parseStringPromise(linexml)
    slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][1]['p:txBody'][0]['a:p'].push(pxmljs['a:p'])
  }
}

async function updateReports(pres, reports) {
  let slide = await pres.getSlide(12)
  reports = reports.trim()
  let lines = reports.split('\n')
  let count = Math.ceil(lines.length / 9)
  let pages = []
  for (let i = 0; i < count; i++) {
    pages.push(lines.slice(i*9, (i+1)*9))
  }
  console.log(pages)
  let ocontent = JSON.stringify(slide.content)
  await pushparagrahtoslide(slide, pages[0])
  slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][2]['p:txBody'][0]['a:p'][0]['a:r'][0]['a:t'] = ['1 / ' + count]
  let slideKey = `ppt/slides/${slide.name}.xml`
  pres.content[slideKey] = slide.content

  for (let ii = 1; ii < count; ii++) {
    await pres.addSlide(async slideii => {
      slideii.content = JSON.parse(ocontent)
      await pushparagrahtoslide(slideii, pages[ii])
      slideii.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][2]['p:txBody'][0]['a:p'][0]['a:r'][0]['a:t'] = [(1+ii) +  ' / ' + count]
      let slideiiKey = `ppt/slides/${slideii.name}.xml`
      pres.content[slideiiKey] = slideii.content
      slideii.moveTo(ii+12)
    }, 'slideLayout16')
  }
}

async function updateGoldenSentence(pres, goldensentence) {
  let scripture = goldensentence.scriptures[0];
  let text = scripture[scripture.search].map(ss => ss.map(s => s.replace(/^\d+/, '')).join('')).join('')
  let goldenSentenceSlide = await pres.getSlide(10)
  let content = JSON.stringify(goldenSentenceSlide.content)
  content = content.replace('我是葡萄树，你们是枝子。住在我里面的，我也住在他里面，他就结出很多果子；因为离开了我，你们就不能作甚么。', text)
  content = content.replace('约翰福音', scripture.bookName)
  content = content.replace('15:5', scripture.chapter)
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
    ['ls日', 'lsdailing','lssishi', 'lssiqing'],
    ['ts日', 'tsdailing','tssishi', 'tssiqing'],
    ['ns日', 'nsdailing','nssishi', 'nssiqing'],
    ['nns日', 'nnsdailing','nnssishi', 'nnssiqing'],
  ]
  let keyholders = ['riqi', 'dailing', 'sishi', 'siqing']
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      content = content.replace(placeholders[i][j], arrangements[i][keyholders[j]])
    }
  }
  updateSlideContent(pres, staffSlide, content)
}

async function updatePreachingArticle(pres, preachingArticle) {
  let slide = await pres.getSlide(15)
  let lines = preachingArticle.split('\n').filter(s => s && !/^\s*$/.test(s)).map(s => {
    let i = s.indexOf('.')
    if (i == -1) {
      i = s.indexOf('。')
    }
    if (i != -1) {
      s = s.substring(i+1)
    }
    s = s.trim()
    return s
  })

  console.log(preachingArticle, lines)

  if (lines.length >= 1) {
    slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][1]['p:txBody'][0]['a:p'][0]['a:r'][0]['a:t'] = [ lines[0] ]
    if (lines.length >= 2) {
      slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][1]['p:txBody'][0]['a:p'][1]['a:r'][1]['a:t'] = [ lines[1] ]
    }
    if (lines.length >= 3) {
      slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][1]['p:txBody'][0]['a:p'][2]['a:r'][1]['a:t'] = [ lines[2] ]
    }
    for (let i = 3; i < lines.length; i++) {
      slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][1]['p:txBody'][0]['a:p'].push(JSON.parse(JSON.stringify(slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][1]['p:txBody'][0]['a:p'][i-1]))); 
      slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][1]['p:txBody'][0]['a:p'][i]['a:r'][0]['a:t'] = [ convertToRoman(i) + '. ' ]
      slide.content['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'][1]['p:txBody'][0]['a:p'][i]['a:r'][1]['a:t'] = [ lines[i] ]
    }
    let slideKey = `ppt/slides/${slide.name}.xml`
    pres.content[slideKey] = slide.content
  }
}

export default async function handler(req, res) {
  console.log(req.body)
  res.writeHead(200, {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  })
  let pptx = new PPTX.Composer()
  await pptx.load(__dirname + '/../../templates/worship.pptx')
  const tmpPPTX = '/tmp/worship' + Math.random() + '.pptx'
  await pptx.compose(async pres => {
    await updateGoldenSentence(pres, req.body.goldensentence)
    await updateStaffArrangements(pres, req.body.staffArranges)
    await updatePreachingArticle(pres, req.body.preachingArticle)
    await updateReports(pres, req.body.reports)
  });

  await pptx.save(tmpPPTX)
  var rs = fs.createReadStream(tmpPPTX)
  rs.on('error', (err) => errEnd(res, err, tmpPPTX))
  rs.on('finish', () => finishEnd(res, tmpPPTX))
  res.on('error', (err) => errEnd(res, err, tmpPPTX))
  res.on('finish', () => finishEnd(res, tmpPPTX))
  rs.pipe(res)
}