// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const PPTX = require('nodejs-pptx')
const fs = require('fs')
const util = require('util')
import { staffArrangeTitle } from '../../utils'
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
    ['nns日', 'nnssdailing','nnssishi', 'nnssiqing'],
  ]
  let keyholders = ['riqi', 'dailing', 'sishi', 'siqing']
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      content = content.replace(placeholders[i][j], arrangements[i][keyholders[j]])
    }
  }
  updateSlideContent(pres, staffSlide, content)
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
  });

  await pptx.save(tmpPPTX)
  var rs = fs.createReadStream(tmpPPTX)
  rs.on('error', (err) => errEnd(res, err, tmpPPTX))
  rs.on('finish', () => finishEnd(res, tmpPPTX))
  res.on('error', (err) => errEnd(res, err, tmpPPTX))
  res.on('finish', () => finishEnd(res, tmpPPTX))
  rs.pipe(res)
}