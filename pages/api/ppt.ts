// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const PPTX = require('er-nodejs-pptx')
const fs = require('fs')

function unlinkCallback(err) {
  if (err) {
    console.log(err)
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

export default async function handler(req, res) {
  console.log(req.body)
  res.writeHead(200, {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  })
  let pptx = new PPTX.Composer()
  await pptx.load(__dirname + '/../../templates/worship.pptx')
  const tmpPPTX = '/tmp/worship' + Math.random() + '.pptx'
  console.log(tmpPPTX)
  
  pptx.compose(pres => {
    let slide = pres.getSlide(1)
    //console.log(slide.getSlideXmlAsString())
  });
  await pptx.save(tmpPPTX)
  var rs = fs.createReadStream(tmpPPTX)
  rs.on('error', (err) => errEnd(res, err, tmpPPTX))
  rs.on('finish', () => finishEnd(res, tmpPPTX))
  res.on('error', (err) => errEnd(res, err, tmpPPTX))
  res.on('finish', () => finishEnd(res, tmpPPTX))
  rs.pipe(res)
}