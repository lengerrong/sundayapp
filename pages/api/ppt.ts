// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const PPTX = require('nodejs-pptx')
const fs = require('fs')
const util = require('util')
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

async function updateGoldenSentence(pres, goldensentence) {
  let scripture = goldensentence.scriptures[0];
  let text = scripture[scripture.search].map(ss => ss.map(s => s.replace(/^\d+/, '')).join('')).join('')
  let goldenSentenceSlide = await pres.getSlide(10)
  let content = JSON.stringify(goldenSentenceSlide.content)
  content = content.replace('我是葡萄树，你们是枝子。住在我里面的，我也住在他里面，他就结出很多果子；因为离开了我，你们就不能作甚么。', text)
  content = content.replace('约翰福音', scripture.bookName)
  content = content.replace('15:5', scripture.chapter)
  goldenSentenceSlide.content = JSON.parse(content)
  let slideKey = `ppt/slides/${goldenSentenceSlide.name}.xml`
  pres.content[slideKey] = goldenSentenceSlide.content
}

export default async function handler(req, res) {
  res.writeHead(200, {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  })
  let pptx = new PPTX.Composer()
  await pptx.load(__dirname + '/../../templates/worship.pptx')
  const tmpPPTX = '/tmp/worship' + Math.random() + '.pptx'
  await pptx.compose(async pres => {
    await updateGoldenSentence(pres, req.body.goldensentence)
  });

  await pptx.save(tmpPPTX)
  var rs = fs.createReadStream(tmpPPTX)
  rs.on('error', (err) => errEnd(res, err, tmpPPTX))
  rs.on('finish', () => finishEnd(res, tmpPPTX))
  res.on('error', (err) => errEnd(res, err, tmpPPTX))
  res.on('finish', () => finishEnd(res, tmpPPTX))
  rs.pipe(res)
}